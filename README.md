# React Native Wheel Color Picker

A color picker component for react native.

## Features
- Pure JS, lightweight, works on Android, iOS and Web
- Uses hue-saturation color wheel and lightness slider
- Selectable from color swatchs
- Smooth and discrete color slider
- Color change animations on wheel, slider and swatches

![Demo Image](https://naeemur.github.io/asset-bucket/rn-wheel-color-picker.gif)

(This demo uses my [react-native-advanced-ripple](https://github.com/Naeemur/react-native-advanced-ripple) and [react-native-elevation](https://github.com/Naeemur/react-native-elevation) modules.)

## Installation

```
npm install react-native-wheel-color-picker
```

## Usage

```js
import { Component } from 'react'
import { View, Text } from 'react-native'

import ColorPicker from 'react-native-wheel-color-picker'

class App extends Component {
	render() {
		return (
			<View style={[]}>
				<ColorPicker
					ref={r => { this.picker = r }}
					color={this.state.currentColor}
					swatchesOnly={this.state.swatchesOnly}
					onColorChange={this.onColorChange}
					onColorChangeComplete={this.onColorChangeComplete}
					thumbSize={40}
					sliderSize={40}
					noSnap={true}
					row={false}
					swatchesLast={this.state.swatchesLast}
					swatches={this.state.swatchesEnabled}
					discrete={this.state.disc}
				/>
				<SomeButton onPress={() => this.picker.revert()} />
			</View>
		)
	}
}

export default App
```

## API

## ***ColorPicker***

## Component props and default values
`row: false` use row or vertical layout

`noSnap: false` enables snapping on the center of wheel and edges of wheel and slider

`thumbSize: 50` wheel color thumb size

`sliderSize: 20` slider and slider color thumb size

`gapSize: 16` size of gap between slider and wheel

`discrete: false` use swatchs of shades instead of slider

`discreteLength: 10` number of swatchs of shades

`sliderHidden: false` if true the slider is hidden

`swatches: true` show color swatches

`swatchesLast: true` if false swatches are shown before wheel

`swatchesOnly: false` show swatch only and hide wheel and slider

`swatchesHitSlop: undefined` defines how far the touch event can start away from the swatch

`color: '#ffffff'` color of the color picker

`palette: ['#000000','#888888','#ed1c24','#d11cd5','#1633e6','#00aeef','#00c85d','#57ff0a','#ffde17','#f26522']` palette colors of swatches

`shadeWheelThumb: true` if true the wheel thumb color is shaded

`shadeSliderThumb: false` if true the slider thumb color is shaded

`autoResetSlider: false` if true the slider thumb is reset to 0 value when wheel thumb is moved

`onInteractionStart: () => {}` callback function triggered when user begins dragging slider/wheel

`onColorChange: (color) => {}` callback function providing current color while user is actively dragging slider/wheel

`onColorChangeComplete: (color) => {}` callback function providing final color when user stops dragging slider/wheel

## Instance methods
`revert()` reverts the color to the one provided in the color prop

## License
The MIT License (MIT)

Copyright (c) 2021 Md. Naeemur Rahman (https://naeemur.github.io)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
