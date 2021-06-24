import * as React from 'react';

export interface ColorPickerProps extends React.Props<ColorPicker> {
  row: boolean,
  noSnap: boolean,
  thumbSize: number,
  sliderSize: number,
  discrete: boolean,
  swatches: boolean,
  swatchesLast: boolean,
  swatchesOnly: boolean,
  color: string,
  shadeWheelThumb: boolean,
  shadeSliderThumb: boolean,
  autoResetSlider: boolean,
  onColorChange(value: string): void,
  onColorChangeComplete(value: string): void,
}

declare class ColorPicker extends React.Component<ColorPickerProps, any> {
  revert(): void;
}

declare module 'react-native-wheel-color-picker-master' {
}

export default ColorPicker;
