# Game Type Icon Mapping

This document describes the automatic icon assignment for each game type across all subjects.

## Implementation

Icons are now **automatically assigned** based on game type. The forms no longer ask users to manually input icon information.

**Location:** `src/utils/gameTypeIcons.ts`

## Alphabet Game Types

| Game Type | Icon Set | Icon Name | Visual Description |
|-----------|----------|-----------|-------------------|
| `phonics` | MaterialCommunityIcons | `volume-high` | Sound/speaker icon |
| `image` | MaterialCommunityIcons | `image` | Picture icon |
| `catching` | MaterialCommunityIcons | `hand-back-right` | Hand catching icon |
| `tracing` | MaterialCommunityIcons | `draw` | Drawing/pencil icon |
| `cards` | MaterialCommunityIcons | `cards` | Playing cards icon |
| `sound` | MaterialCommunityIcons | `volume-high` | Sound/speaker icon |
| `mixed` | MaterialCommunityIcons | `star` | Star icon |

## Number Game Types

| Game Type | Icon Set | Icon Name | Visual Description |
|-----------|----------|-----------|-------------------|
| `counting` | MaterialCommunityIcons | `counter` | Counter/tally icon |
| `dragndrop` | MaterialCommunityIcons | `hand-pointing-right` | Hand pointing icon |
| `tracing` | MaterialCommunityIcons | `draw` | Drawing/pencil icon |
| `cards` | MaterialCommunityIcons | `cards` | Playing cards icon |
| `matching` | MaterialCommunityIcons | `puzzle` | Puzzle piece icon |
| `image` | MaterialCommunityIcons | `image` | Picture icon |
| `sound` | MaterialCommunityIcons | `volume-high` | Sound/speaker icon |
| `catching` | MaterialCommunityIcons | `hand-back-right` | Hand catching icon |
| `mixed` | MaterialCommunityIcons | `star` | Star icon |

## Color Game Types

| Game Type | Icon Set | Icon Name | Visual Description |
|-----------|----------|-----------|-------------------|
| `colorRecognition` | MaterialCommunityIcons | `palette` | Paint palette icon |
| `colorMultipleChoice` | MaterialCommunityIcons | `palette` | Paint palette icon |
| `rocket` | MaterialCommunityIcons | `rocket` | Rocket icon |
| `matching` | MaterialCommunityIcons | `puzzle` | Puzzle piece icon |
| `catching` | MaterialCommunityIcons | `hand-back-right` | Hand catching icon |
| `phonics` | MaterialCommunityIcons | `volume-high` | Sound/speaker icon |
| `tracing` | MaterialCommunityIcons | `draw` | Drawing/pencil icon |
| `cards` | MaterialCommunityIcons | `cards` | Playing cards icon |
| `image` | MaterialCommunityIcons | `image` | Picture icon |
| `sound` | MaterialCommunityIcons | `volume-high` | Sound/speaker icon |
| `mixed` | MaterialCommunityIcons | `star` | Star icon |

## Shape Game Types

| Game Type | Icon Set | Icon Name | Visual Description |
|-----------|----------|-----------|-------------------|
| `shapeRecognition` | MaterialCommunityIcons | `shape` | Generic shape icon |
| `shapesMultipleChoice` | MaterialCommunityIcons | `shape` | Generic shape icon |
| `rocketShapes` | MaterialCommunityIcons | `rocket` | Rocket icon |
| `rocket` | MaterialCommunityIcons | `rocket` | Rocket icon |
| `matching` | MaterialCommunityIcons | `puzzle` | Puzzle piece icon |
| `catching` | MaterialCommunityIcons | `hand-back-right` | Hand catching icon |
| `racing` | MaterialCommunityIcons | `car-sports` | Sports car icon |
| `fallingObjects` | MaterialCommunityIcons | `arrow-down-circle` | Falling/down arrow icon |
| `tracing` | MaterialCommunityIcons | `draw` | Drawing/pencil icon |
| `cards` | MaterialCommunityIcons | `cards` | Playing cards icon |
| `image` | MaterialCommunityIcons | `image` | Picture icon |
| `sound` | MaterialCommunityIcons | `volume-high` | Sound/speaker icon |
| `mixed` | MaterialCommunityIcons | `star` | Star icon |

## Common Patterns

- **Sound/Audio games**: `volume-high` icon
- **Drawing/Writing games**: `draw` icon
- **Memory card games**: `cards` icon
- **Matching/Puzzle games**: `puzzle` icon
- **Catching games**: `hand-back-right` icon
- **Racing games**: `car-sports` icon (shapes only)
- **Rocket games**: `rocket` icon
- **Mixed games**: `star` icon
- **Recognition games**: Subject-specific icon (`palette`, `shape`, etc.)

## Usage in Forms

All four level forms (`AlphabetLevelForm`, `NumberLevelForm`, `ColorLevelForm`, `ShapeLevelForm`) now:

1. Import the appropriate icon mapping from `utils/gameTypeIcons.ts`
2. Automatically assign icons based on the selected game type
3. Display the auto-assigned icon in a read-only field labeled "Icon (Auto-assigned)"
4. No longer include manual icon input fields (Icon Set and Icon Name dropdowns/inputs removed)

## Benefits

- **Consistency**: All levels of the same game type have the same icon
- **Simplicity**: Users don't need to remember or choose icons
- **Maintainability**: Icons can be updated centrally in one location
- **User Experience**: Faster level creation with fewer fields to fill
