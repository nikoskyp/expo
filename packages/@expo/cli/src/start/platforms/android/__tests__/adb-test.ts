import { CommandError } from '../../../../utils/errors';
import {
  Device,
  getAdbNameForDeviceIdAsync,
  getAttachedDevicesAsync,
  getDeviceABIsAsync,
  getPropertyDataForDeviceAsync,
  getServer,
  isBootAnimationCompleteAsync,
  isDeviceBootedAsync,
  isPackageInstalledAsync,
  launchActivityAsync,
  openAppIdAsync,
} from '../adb';

jest.mock('../ADBServer', () => ({
  ADBServer: jest.fn(() => ({
    runAsync: jest.fn(async () => ''),
    getFileOutputAsync: jest.fn(async () => ''),
  })),
}));

const asMock = <T extends (...args: any[]) => any>(fn: T): jest.MockedFunction<T> =>
  fn as jest.MockedFunction<T>;

const asDevice = (device: Partial<Device>): Device => device as Device;

const device = asDevice({ name: 'Pixel 5', pid: '123' });

describe(launchActivityAsync, () => {
  it(`asserts that the launch activity does not exist`, async () => {
    asMock(getServer().runAsync).mockResolvedValueOnce(
      'Error: Activity class dev.bacon.app/.MainActivity does not exist.'
    );
    await expect(
      launchActivityAsync(device, {
        launchActivity: 'dev.bacon.app/.MainActivity',
      })
    ).rejects.toThrow(CommandError);
  });
  it(`runs`, async () => {
    asMock(getServer().runAsync).mockResolvedValueOnce('...');
    await launchActivityAsync(device, {
      launchActivity: 'dev.bacon.app/.MainActivity',
    });
    expect(getServer().runAsync).toBeCalledWith([
      '-s',
      '123',
      'shell',
      'am',
      'start',
      '-a',
      'android.intent.action.RUN',
      '-f',
      '0x20000000',
      '-n',
      'dev.bacon.app/.MainActivity',
    ]);
  });
});

describe(isPackageInstalledAsync, () => {
  it(`returns true when a package is installed`, async () => {
    asMock(getServer().runAsync).mockResolvedValueOnce(
      [
        'package:com.google.android.networkstack.tethering',
        'package:com.android.cts.priv.ctsshim',
        'package:com.google.android.youtube',
      ].join('\n')
    );
    expect(await isPackageInstalledAsync(device, 'com.google.android.youtube')).toBe(true);
    expect(getServer().runAsync).toBeCalledWith([
      '-s',
      '123',
      'shell',
      'pm',
      'list',
      'packages',
      'com.google.android.youtube',
    ]);
  });
  it(`returns false when a package is not isntalled`, async () => {
    asMock(getServer().runAsync).mockResolvedValueOnce('');
    expect(await isPackageInstalledAsync(device, 'com.google.android.youtube')).toBe(false);
  });
});

describe(openAppIdAsync, () => {
  it(`asserts that the app does not exist`, async () => {
    asMock(getServer().runAsync).mockResolvedValueOnce(
      'Error: Activity not started, unable to resolve Intent'
    );
    await expect(
      openAppIdAsync(device, {
        applicationId: 'dev.bacon.app',
      })
    ).rejects.toThrow(CommandError);
  });
});

describe(getAdbNameForDeviceIdAsync, () => {
  it(`returns a device name`, async () => {
    asMock(getServer().runAsync).mockResolvedValueOnce(['Pixel_4_XL_API_30', 'OK'].join('\n'));

    expect(await getAdbNameForDeviceIdAsync(asDevice({ pid: 'emulator-5554' }))).toBe(
      'Pixel_4_XL_API_30'
    );
  });
  it(`asserts when a device is not found`, async () => {
    asMock(getServer().runAsync).mockResolvedValueOnce(
      'error: could not connect to TCP port 55534: Connection refused'
    );

    await expect(
      getAdbNameForDeviceIdAsync(asDevice({ pid: 'emulator-5554' }))
    ).rejects.toThrowError(CommandError);
  });
});

describe(isDeviceBootedAsync, () => {
  it(`returns a device when booted`, async () => {
    asMock(getServer().runAsync)
      .mockResolvedValueOnce(
        [
          'List of devices attached',
          'emulator-5554          device product:sdk_gphone_x86_arm model:sdk_gphone_x86_arm device:generic_x86_arm transport_id:1',
          '',
        ].join('\n')
      )
      .mockResolvedValueOnce(
        // Return the emulator name
        ['Pixel_4_XL_API_30', 'OK'].join('\n')
      );

    expect(await isDeviceBootedAsync(asDevice({ name: 'Pixel_4_XL_API_30' }))).toStrictEqual({
      isAuthorized: true,
      isBooted: true,
      name: 'Pixel_4_XL_API_30',
      pid: 'emulator-5554',
      type: 'emulator',
    });
  });

  it(`returns null when the device is not booted`, async () => {
    asMock(getServer().runAsync).mockResolvedValueOnce('');
    expect(await isDeviceBootedAsync(device)).toBe(null);
  });
});

describe(getAttachedDevicesAsync, () => {
  it(`gets devices`, async () => {
    asMock(getServer().runAsync)
      .mockResolvedValueOnce(
        [
          'List of devices attached',
          // unauthorized
          'FA8251A00719 unauthorized usb:338690048X transport_id:5',
          // authorized
          'FA8251A00720 device usb:338690048X product:walleye model:Pixel_2 device:walleye transport_id:4',
          // Emulator
          'emulator-5554          device product:sdk_gphone_x86_arm model:sdk_gphone_x86_arm device:generic_x86_arm transport_id:1',
          '',
        ].join('\n')
      )
      .mockResolvedValueOnce(
        // Return the emulator name
        ['Pixel_4_XL_API_30', 'OK'].join('\n')
      );

    const devices = await getAttachedDevicesAsync();

    expect(devices).toEqual([
      {
        isAuthorized: false,
        isBooted: true,
        name: 'Device FA8251A00719',
        pid: 'FA8251A00719',
        type: 'device',
      },
      {
        isAuthorized: true,
        isBooted: true,
        name: 'Pixel_2',
        pid: 'FA8251A00720',
        type: 'device',
      },
      {
        isAuthorized: true,
        isBooted: true,
        name: 'Pixel_4_XL_API_30',

        pid: 'emulator-5554',
        type: 'emulator',
      },
    ]);
  });
});

describe(isBootAnimationCompleteAsync, () => {
  it(`returns true if the boot animation is complete for a device`, async () => {
    asMock(getServer().getFileOutputAsync).mockResolvedValueOnce(
      ['[init.svc.bootanim]: [stopped]'].join('\n')
    );

    await expect(isBootAnimationCompleteAsync()).resolves.toBe(true);
  });
  it(`returns false if the boot animation is not complete`, async () => {
    asMock(getServer().getFileOutputAsync).mockResolvedValueOnce(
      ['[init.svc.bootanim]: [running]'].join('\n')
    );
    await expect(isBootAnimationCompleteAsync()).resolves.toBe(false);
  });
  it(`returns false if the properties cannot be read`, async () => {
    asMock(getServer().getFileOutputAsync).mockImplementationOnce(() => {
      throw new Error('File not found');
    });

    await expect(isBootAnimationCompleteAsync()).resolves.toBe(false);
  });
});

describe(getPropertyDataForDeviceAsync, () => {
  it(`returns parsed property data`, async () => {
    asMock(getServer().getFileOutputAsync).mockResolvedValueOnce(
      [
        '[wifi.direct.interface]: [p2p-dev-wlan0]',
        '[init.svc.bootanim]: [stopped]',
        '[wifi.interface]: [wlan0]',
        // Should be stripped
        '[invalid]: foobar',
      ].join('\n')
    );

    await expect(getPropertyDataForDeviceAsync(asDevice({ pid: '123' }))).resolves.toStrictEqual({
      'init.svc.bootanim': 'stopped',
      'wifi.direct.interface': 'p2p-dev-wlan0',
      'wifi.interface': 'wlan0',
    });
  });
});

describe(getDeviceABIsAsync, () => {
  it(`returns a list of device ABIs`, async () => {
    asMock(getServer().getFileOutputAsync).mockResolvedValueOnce(
      ['x86,armeabi-v7a,armeabi', ''].join('\n')
    );
    await expect(isBootAnimationCompleteAsync()).resolves.toBe(false);
  });
});
