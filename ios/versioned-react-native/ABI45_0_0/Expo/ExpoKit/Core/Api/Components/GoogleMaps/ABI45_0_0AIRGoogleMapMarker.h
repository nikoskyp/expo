//
//  ABI45_0_0AIRGoogleMapMarker.h
//  AirMaps
//
//  Created by Gil Birman on 9/2/16.
//

#ifdef ABI45_0_0HAVE_GOOGLE_MAPS

#import <GoogleMaps/GoogleMaps.h>
#import <ABI45_0_0React/ABI45_0_0RCTBridge.h>
#import "ABI45_0_0AIRGMSMarker.h"
#import "ABI45_0_0AIRGoogleMap.h"
#import "ABI45_0_0AIRGoogleMapCallout.h"
#import "ABI45_0_0AIRGoogleMapCalloutSubview.h"

@interface ABI45_0_0AIRGoogleMapMarker : UIView

@property (nonatomic, weak) ABI45_0_0RCTBridge *bridge;
@property (nonatomic, strong) ABI45_0_0AIRGoogleMapCallout *calloutView;
@property (nonatomic, strong) NSString *identifier;
@property (nonatomic, assign) CLLocationCoordinate2D coordinate;
@property (nonatomic, assign) CLLocationDegrees rotation;
@property (nonatomic, strong) ABI45_0_0AIRGMSMarker* realMarker;
@property (nonatomic, copy) ABI45_0_0RCTBubblingEventBlock onPress;
@property (nonatomic, copy) ABI45_0_0RCTDirectEventBlock onDragStart;
@property (nonatomic, copy) ABI45_0_0RCTDirectEventBlock onDrag;
@property (nonatomic, copy) ABI45_0_0RCTDirectEventBlock onDragEnd;
@property (nonatomic, copy) NSString *imageSrc;
@property (nonatomic, copy) NSString *iconSrc;
@property (nonatomic, copy) NSString *title;
@property (nonatomic, copy) NSString *subtitle;
@property (nonatomic, strong) UIColor *pinColor;
@property (nonatomic, assign) CGPoint anchor;
@property (nonatomic, assign) CGPoint calloutAnchor;
@property (nonatomic, assign) NSInteger zIndex;
@property (nonatomic, assign) double opacity;
@property (nonatomic, assign) BOOL draggable;
@property (nonatomic, assign) BOOL tappable;
@property (nonatomic, assign) BOOL tracksViewChanges;
@property (nonatomic, assign) BOOL tracksInfoWindowChanges;

- (void)showCalloutView;
- (void)hideCalloutView;
- (void)redraw;
- (UIView *)markerInfoContents;
- (UIView *)markerInfoWindow;
- (void)didTapInfoWindowOfMarker:(ABI45_0_0AIRGMSMarker *)marker;
- (void)didTapInfoWindowOfMarker:(ABI45_0_0AIRGMSMarker *)marker point:(CGPoint)point frame:(CGRect)frame;
- (void)didTapInfoWindowOfMarker:(ABI45_0_0AIRGMSMarker *)marker subview:(ABI45_0_0AIRGoogleMapCalloutSubview*)subview point:(CGPoint)point frame:(CGRect)frame;
- (void)didBeginDraggingMarker:(ABI45_0_0AIRGMSMarker *)marker;
- (void)didEndDraggingMarker:(ABI45_0_0AIRGMSMarker *)marker;
- (void)didDragMarker:(ABI45_0_0AIRGMSMarker *)marker;
@end

#endif
