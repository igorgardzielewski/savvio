// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

/**
 * SF Symbols → Material Icons mapping.
 * Covers all icons used across the app (static + dynamic from backend).
 *
 * @see Material Icons: https://icons.expo.fyi
 * @see SF Symbols: https://developer.apple.com/sf-symbols/
 */
const MAPPING: Record<string, MaterialIconName> = {
  // ── Navigation & Chrome ──────────────────────────────────────
  'house.fill': 'home',
  'house': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'chevron.down': 'expand-more',
  'arrow.left': 'arrow-back',
  'arrow.right': 'arrow-forward',
  'arrow.up': 'arrow-upward',
  'arrow.down': 'arrow-downward',
  'arrow.counterclockwise': 'replay',
  'ellipsis': 'more-horiz',
  'magnifyingglass': 'search',
  'gear': 'settings',
  'rectangle.portrait.and.arrow.right': 'logout',
  'person': 'person',

  // ── Actions ──────────────────────────────────────────────────
  'checkmark': 'check',
  'checkmark.circle.fill': 'check-circle',
  'xmark': 'close',
  'xmark.circle.fill': 'cancel',
  'plus': 'add',
  'plus.circle.fill': 'add-circle',
  'minus': 'remove',
  'minus.circle.fill': 'remove-circle',
  'trash': 'delete',
  'bin.xmark': 'delete',
  'square.and.pencil': 'edit',
  'pencil': 'edit',

  // ── Media & Input ────────────────────────────────────────────
  'camera': 'camera-alt',
  'camera.fill': 'camera-alt',
  'camera.aperture': 'camera',
  'doc.text': 'description',
  'note': 'note',
  'bell.fill': 'notifications',
  'eye': 'visibility',
  'eye.slash': 'visibility-off',
  'lock.fill': 'lock',

  // ── Finance & Charts ─────────────────────────────────────────
  'cart': 'shopping-cart',
  'creditcard': 'credit-card',
  'dollarsign.gauge.chart.lefthalf.righthalf': 'speed',
  'chart.pie': 'pie-chart',
  'chart.bar.doc.horizontal': 'bar-chart',
  'list.bullet.rectangle': 'list',
  'number': 'tag',
  'percent': 'percent',
  'calendar': 'calendar-today',
  'clock': 'schedule',

  // ── Budget Category / Shop icons ─────────────────────────────
  'car': 'directions-car',
  'bag': 'shopping-bag',
  'tshirt': 'checkroom',
  'takeoutbag.and.cup.and.straw': 'fastfood',
  'gamecontroller': 'sports-esports',
  'cross.case': 'medical-services',
  'airplane': 'flight',
  'fork.knife': 'restaurant',
  'gift': 'card-giftcard',
  'laptopcomputer': 'laptop',
  'heart': 'favorite',
  'ticket': 'confirmation-number',
  'fuelpump': 'local-gas-station',
  'tv': 'tv',
  'popcorn': 'movie',
  'pill': 'medication',
  'cup.and.heat.waves': 'local-cafe',
  'basketball': 'sports-basketball',
  'book': 'menu-book',
  'location.fill': 'location-on',

  // ── Goals ────────────────────────────────────────────────────
  'target': 'gps-fixed',
  'graduationcap': 'school',
  'globe': 'public',
  'bicycle': 'pedal-bike',

  // ── Alerts & Status ──────────────────────────────────────────
  'exclamationmark.triangle.fill': 'warning',
  'lightbulb.fill': 'lightbulb',
  'questionmark.circle.fill': 'help-outline',
};

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 *
 * If an SF Symbol name has no mapping, falls back to `help-outline` so the app
 * never crashes on Android due to an unmapped dynamic icon from the backend.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: string;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const materialName = MAPPING[name] ?? 'help-outline';
  return <MaterialIcons color={color} size={size} name={materialName} style={style} />;
}

