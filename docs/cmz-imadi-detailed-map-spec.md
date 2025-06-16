# CMZ-Imadi Detailed Area Map - Technical Specification v2

## Overview

Create an interactive, street-level detailed map for the Saifee Masjid CMZ and Imadi Zone area with Google Maps navigation integration. This version integrates with the existing POI system and focuses on clean, uncluttered UX.

## Route Structure

```
/                    → Main map (city-wide view with POI filtering)
/area/cmz-imadi     → Detailed CMZ-Imadi area map
```

## File Structure to Create

```
src/
├── app/
│   └── area/
│       └── cmz-imadi/
│           └── page.tsx           → New detailed map page
├── components/
│   ├── DetailedAreaMap.tsx       → New detailed map component
│   └── AreaNavigation.tsx        → Navigation between main/detailed
└── data/
    └── areaDetails.ts            → CMZ-Imadi specific data (integrates with POI system)
```

## Data Structure Design

### Enhanced AreaPoint Interface (extends existing POI)

```typescript
export interface AreaPoint extends POI {
  // Inherits from existing POI interface
  buildingNumber?: string;
  floor?: string;
  entrance?: string;
  isMainFacility?: boolean;
  walkingTimeFromCMZ?: number; // in minutes
  walkingTimeFromImadi?: number; // in minutes
}

export interface AreaConfig {
  center: [number, number];
  defaultZoom: number;
  bounds: [[number, number], [number, number]];
  maxBounds: [[number, number], [number, number]];
  zones: {
    cmz: AreaPoint;
    imadi: AreaPoint;
  };
  facilities: AreaPoint[];
}
```

## UX Design Principles

### Clean, Uncluttered Interface

1. **Progressive Disclosure**: Show essential info first, details on interaction
2. **Smart Grouping**: Group related facilities together
3. **Visual Hierarchy**: Use size, color, and typography to guide attention
4. **Minimal UI**: Hide complex controls until needed
5. **Mobile-First**: Optimize for thumb navigation

### Marker Strategy

```typescript
const markerPriority = {
  primary: { size: 48, showLabel: true }, // Main zones (CMZ, Imadi)
  secondary: { size: 36, showLabel: true }, // Important facilities (Khaas medical)
  tertiary: { size: 28, showLabel: false }, // Other facilities
  micro: { size: 20, showLabel: false }, // Entrances, parking
};
```

## Technical Implementation Plan

### Phase 1: Core Foundation

1. **Create route structure** with clean navigation
2. **Build DetailedAreaMap component** with smart marker clustering
3. **Add main zones** (CMZ & Imadi) with enhanced detail
4. **Implement smooth zoom transitions** and bounds

### Phase 2: Smart Facility Integration

1. **Progressive POI loading** based on zoom level
2. **Contextual filtering** (show relevant facilities first)
3. **Smart search** with autocomplete
4. **Walking directions** with time estimates

### Phase 3: Enhanced UX

1. **Bottom sheet** for mobile facility details
2. **Quick actions** (call, navigate, share)
3. **Offline capability** with cached data
4. **Accessibility** features

## Interactive Features

### Smart Filter System

```typescript
const filterCategories = {
  essential: ["masjid", "medical", "khaas"],
  facilities: ["food", "accommodation", "parking"],
  navigation: ["entrance", "landmark"],
};
```

### Progressive Zoom Levels

- **Zoom 14-15**: Show only main zones
- **Zoom 16-17**: Add primary facilities
- **Zoom 18+**: Show all details including entrances

### Clean Navigation

- **Floating back button** (top-left)
- **Search overlay** (expandable)
- **Category chips** (horizontal scroll)
- **Quick zoom buttons** (CMZ/Imadi)

## Mobile-Optimized Layout

### Header (Collapsible)

```
┌─────────────────────────────────────┐
│ [←] CMZ-Imadi Area        [🔍] [≡] │ ← Minimal header
└─────────────────────────────────────┘
```

### Map Area (Full Screen)

```
┌─────────────────────────────────────┐
│                                     │
│        INTERACTIVE MAP              │
│      (Smart markers by zoom)        │
│                                     │
│  [CMZ] [Imadi] ← Quick nav chips    │
└─────────────────────────────────────┘
```

### Bottom Sheet (Expandable)

```
┌─────────────────────────────────────┐
│ ◦◦◦ Facilities near you             │ ← Drag handle
│ 🏥 Mahal us Shifa - 2 min walk     │
│ 🍽️ Food Court - 5 min walk         │
└─────────────────────────────────────┘
```

## Performance & UX Optimizations

### Smart Loading

- **Lazy load** facility details
- **Preload** critical navigation data
- **Cache** frequently accessed areas
- **Optimize** marker rendering for performance

### Gesture Support

- **Pinch to zoom** with smart marker scaling
- **Tap to select** with haptic feedback
- **Long press** for quick actions menu
- **Swipe** between facility details

## Integration with Existing POI System

### Reuse POI Categories

```typescript
// Extend existing POI_CATEGORIES
export const AREA_POI_ENHANCEMENTS = {
  ...POI_CATEGORIES,
  entrance: { name: "Entrance", icon: "🚪", color: "#6B7280" },
  landmark: { name: "Landmark", icon: "📍", color: "#8B5CF6" },
};
```

### Enhanced POI Data

```typescript
export const cmzImadiEnhancedPOIs = [
  ...existingCMZPOIs.map((poi) => ({
    ...poi,
    walkingTimeFromCMZ: calculateWalkingTime(poi.coordinates, cmzCoordinates),
    buildingNumber: extractBuildingInfo(poi),
    isMainFacility: poi.category === "masjid" || poi.category === "khaas",
  })),
];
```

## Clean UI Components

### Marker Styles (Uncluttered)

```typescript
const cleanMarkerStyles = {
  primary: {
    size: 48,
    showIcon: true,
    showLabel: true,
    labelStyle: "prominent",
  },
  secondary: {
    size: 36,
    showIcon: true,
    showLabel: true,
    labelStyle: "subtle",
  },
  micro: {
    size: 24,
    showIcon: true,
    showLabel: false,
    showOnlyOnZoom: 17,
  },
};
```

### Information Hierarchy

1. **Primary**: Zone names and main facilities
2. **Secondary**: Important POIs (Khaas medical)
3. **Tertiary**: Supporting facilities
4. **Details**: Only shown on tap/interaction

## Success Metrics

### User Experience

- **Task completion rate** > 95% for navigation
- **Time to find facility** < 30 seconds
- **Mobile usability score** > 90
- **User satisfaction** > 4.5/5

### Performance

- **Initial load time** < 2 seconds
- **Marker render time** < 500ms
- **Search response time** < 300ms
- **Smooth animations** 60fps

## Implementation Priority

### Must Have (Phase 1)

- ✅ Clean route and page structure
- ✅ CMZ and Imadi zones with enhanced details
- ✅ Smart marker system with progressive disclosure
- ✅ Mobile-optimized navigation

### Should Have (Phase 2)

- ✅ Enhanced POI integration
- ✅ Smart filtering and search
- ✅ Walking time calculations
- ✅ Bottom sheet for mobile

### Nice to Have (Phase 3)

- ✅ Offline capability
- ✅ Quick actions menu
- ✅ Accessibility features
- ✅ Analytics tracking

---

## Development Guidelines

### Code Quality

- **Clean components** with single responsibility
- **Performance optimized** marker rendering
- **Accessible** keyboard and screen reader support
- **Progressive enhancement** for offline scenarios

### Design System

- **Consistent spacing** (4px grid)
- **Color hierarchy** following existing POI system
- **Typography scale** with clear hierarchy
- **Touch targets** minimum 44px

## Sign-off

This specification focuses on creating a clean, uncluttered detailed area map that integrates seamlessly with the existing POI system while providing an excellent user experience.

**Last Updated**: December 2024
**Status**: Approved for Implementation - V2 with POI Integration
