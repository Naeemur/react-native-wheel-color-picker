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

`discrete: false` use swatchs of shades instead of slider

`swatches: true` show color swatches

`swatchesLast: true` if false swatches are shown before wheel

`swatchesOnly: false` show swatch only and hide wheel and slider

`color: '#ffffff'` color of the color picker

`onColorChange: () => {}` callback function for slider and wheel thumb movement 

`onColorChangeComplete: () => {}` callback function for when the slider and wheel thumb stops moving

## Instance methods
`revert()` reverts the color to the one provided in the color prop

## License
The MIT License (MIT)

Copyright (c) 2020 Md. Naeemur Rahman (https://naeemur.github.io)

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