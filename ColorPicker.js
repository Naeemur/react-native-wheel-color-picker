// @flow

const React = require('react'), { Component } = React

const {
	Animated,
	Image,
	Dimensions,
	PanResponder,
	StyleSheet,
	TouchableWithoutFeedback,
	View,
	Text,
} = require('react-native')

const Elevations = require('react-native-elevation')
const srcWheel = require('./assets/graphics/ui/color-wheel.png')
const srcSlider = require('./assets/graphics/ui/black-gradient.png')
const srcSliderRotated = require('./assets/graphics/ui/black-gradient-rotated.png')

const PALLETE = [
	'#000000',
	'#888888',
	'#ed1c24',
	'#d11cd5',
	'#1633e6',
	'#00aeef',
	'#00c85d',
	'#57ff0a',
	'#ffde17',
	'#f26522',
]

const RGB_MAX = 255
const HUE_MAX = 360
const SV_MAX = 100

const normalize = (degrees) => ((degrees % 360 + 360) % 360)

const rgb2Hsv = (r, g, b) => {
	if (typeof r === 'object') {
		const args = r
		r = args.r; g = args.g; b = args.b;
	}

	// It converts [0,255] format, to [0,1]
	r = (r === RGB_MAX) ? 1 : (r % RGB_MAX / parseFloat(RGB_MAX))
	g = (g === RGB_MAX) ? 1 : (g % RGB_MAX / parseFloat(RGB_MAX))
	b = (b === RGB_MAX) ? 1 : (b % RGB_MAX / parseFloat(RGB_MAX))

	let max = Math.max(r, g, b)
	let min = Math.min(r, g, b)
	let h, s, v = max

	let d = max - min

	s = max === 0 ? 0 : d / max

	if (max === min) {
		h = 0 // achromatic
	} else {
		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0)
				break
			case g:
				h = (b - r) / d + 2
				break
			case b:
				h = (r - g) / d + 4
				break
		}
		h /= 6
	}

	return {
		h: Math.round(h * HUE_MAX),
		s: Math.round(s * SV_MAX),
		v: Math.round(v * SV_MAX)
	}
}

const hsv2Rgb = (h, s, v) => {
	if (typeof h === 'object') {
		const args = h
		h = args.h; s = args.s; v = args.v;
	}

	h = normalize(h)
	h = (h === HUE_MAX) ? 1 : (h % HUE_MAX / parseFloat(HUE_MAX) * 6)
	s = (s === SV_MAX) ? 1 : (s % SV_MAX / parseFloat(SV_MAX))
	v = (v === SV_MAX) ? 1 : (v % SV_MAX / parseFloat(SV_MAX))

	let i = Math.floor(h)
	let f = h - i
	let p = v * (1 - s)
	let q = v * (1 - f * s)
	let t = v * (1 - (1 - f) * s)
	let mod = i % 6
	let r = [v, q, p, p, t, v][mod]
	let g = [t, v, v, q, p, p][mod]
	let b = [p, p, t, v, v, q][mod]

	return {
		r: Math.floor(r * RGB_MAX),
		g: Math.floor(g * RGB_MAX),
		b: Math.floor(b * RGB_MAX),
	}
}

const rgb2Hex = (r, g, b) => {
	if (typeof r === 'object') {
		const args = r
		r = args.r; g = args.g; b = args.b;
	}
	r = Math.round(r).toString(16)
	g = Math.round(g).toString(16)
	b = Math.round(b).toString(16)

	r = r.length === 1 ? '0' + r : r
	g = g.length === 1 ? '0' + g : g
	b = b.length === 1 ? '0' + b : b

	return '#' + r + g + b
}

const hex2Rgb = (hex) => {
	let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null
}

const hsv2Hex = (h, s, v) => {
	let rgb = hsv2Rgb(h, s, v)
	return rgb2Hex(rgb.r, rgb.g, rgb.b)
}

const hex2Hsv = (hex) => {
	let rgb = hex2Rgb(hex)
	return rgb2Hsv(rgb.r, rgb.g, rgb.b)
}


module.exports = class ColorPicker extends Component {
	// testData = {}
	// testView = {forceUpdate(){}}
	color = {h:0,s:0,v:100}
	slideX = new Animated.Value(0)
	slideY = new Animated.Value(0)
	panX = new Animated.Value(30)
	panY = new Animated.Value(30)
	sliderLength = 0
	wheelSize = 0
	sliderMeasure = {}
	wheelMeasure = {}
	wheelWidth = 0
	swatchAnim = PALLETE.map((c,i) => (new Animated.Value(0)))
	discAnim = PALLETE.map((c,i) => (new Animated.Value(0)))
	static defaultProps = {
		row: false,
		noSnap: false,
		thumbSize: 50,
		sliderSize: 20,
		discrete: false,
		swatches: true,
		swatchesLast: true,
		swatchesOnly: false,
		color: '#ffffff',
		onColorChange: () => {},
		onColorChangeComplete: () => {},
	}
	wheelPanResponder = PanResponder.create({
		onStartShouldSetPanResponderCapture: (event, gestureState) => {
			const {nativeEvent} = event
			if (this.outOfWheel(nativeEvent)) return
			this.wheelMovement(event, gestureState)
			this.updateHueSaturation({nativeEvent})
			return true
		},
		onStartShouldSetPanResponder: () => true,
		onMoveShouldSetPanResponderCapture: () => true,
		onPanResponderGrant: (event, gestureState) => {
			const { locationX, locationY } = event.nativeEvent
			const { moveX, moveY, x0, y0 } = gestureState
			const x = x0 - locationX, y = y0 - locationY
			this.wheelMeasure.x = x
			this.wheelMeasure.y = y
			return true
		},
		onPanResponderMove: (event, gestureState) => {
			if (this.outOfWheel(event.nativeEvent) || this.outOfBox(this.wheelMeasure, gestureState)) return;
			this.wheelMovement(event, gestureState)
		},
		onMoveShouldSetPanResponder: () => true,
		onPanResponderRelease: (event, gestureState) => {
			const {nativeEvent} = event
			const {radius} = this.polar(nativeEvent)
			const {hsv} = this.state
			const {h,s,v} = hsv
			if (!this.props.noSnap && radius <= 0.10 && radius >= 0) this.animate('#ffffff', 'hs', false, true)
			if (!this.props.noSnap && radius >= 0.95 && radius <= 1) this.animate(this.state.currentColor, 'hs', true)
			if (this.props.onColorChangeComplete) this.props.onColorChangeComplete(hsv2Hex(hsv))
			this.setState({currentColor:this.state.currentColor}, x=>this.renderDiscs())
		},
	})
	sliderPanResponder = PanResponder.create({
		onStartShouldSetPanResponderCapture: (event, gestureState) => {
			const {nativeEvent} = event
			if (this.outOfSlider(nativeEvent)) return
			this.sliderMovement(event, gestureState)
			this.updateValue({nativeEvent})
			return true
		},
		onStartShouldSetPanResponder: () => true,
		onMoveShouldSetPanResponderCapture: () => true,
		onPanResponderGrant: (event, gestureState) => {
			const { locationX, locationY } = event.nativeEvent
			const { moveX, moveY, x0, y0 } = gestureState
			const x = x0 - locationX, y = y0 - locationY
			this.sliderMeasure.x = x
			this.sliderMeasure.y = y
			return true
		},
		onPanResponderMove: (event, gestureState) => {
			if (this.outOfSlider(event.nativeEvent) || this.outOfBox(this.sliderMeasure, gestureState)) return;
			this.sliderMovement(event, gestureState)
		},
		onMoveShouldSetPanResponder: () => true,
		onPanResponderRelease: (event, gestureState) => {
			const {nativeEvent} = event
			const {hsv} = this.state
			const {h,s,v} = hsv
			const ratio = this.ratio(nativeEvent)
			if (!this.props.noSnap && ratio <= 0.05 && ratio >= 0) this.animate(this.state.currentColor, 'v', false)
			if (!this.props.noSnap && ratio >= 0.95 && ratio <= 1) this.animate(this.state.currentColor, 'v', true)
			if (this.props.onColorChangeComplete) this.props.onColorChangeComplete(hsv2Hex(hsv))
		},
	})
	constructor (props) {
		super(props)
		this.mounted = false
		this.state = {
			wheelOpacity: 0,
			sliderOpacity: 0,
			hueSaturation: hsv2Hex(this.color.h,this.color.s,100),
			currentColor: props.color,
			hsv: {h:0,s:0,v:100},
		}
		this.wheelMovement = new Animated.event(
			[
				{
					nativeEvent: {
						locationX: this.panX,
						locationY: this.panY,
					}
				},
				null,
			],
			{listener: this.updateHueSaturation}
		)
		this.sliderMovement = new Animated.event(
			[
				{
					nativeEvent: {
						locationX: this.slideX,
						locationY: this.slideY,
					}
				},
				null,
			],
			{listener: this.updateValue}
		)
		this.renderSwatches()
		this.renderDiscs()
	}
	componentDidMount() {
		this.mounted = true;
	}
	componentWillUnmount() {
		this.mounted = false;
	}
	onSwatchPress = (c,i) => {
		this.swatchAnim[i].stopAnimation()
		Animated.timing(this.swatchAnim[i], {
			toValue: 1,
			duration: 500,
		}).start(x=>{
			this.swatchAnim[i].setValue(0)
		})
		this.animate(c)
	}
	onDiscPress = (c,i) => {
		this.discAnim[i].stopAnimation()
		Animated.timing(this.discAnim[i], {
			toValue: 1,
			duration: 500,
		}).start(x=>{
			this.discAnim[i].setValue(0)
		})
		const val = i>=9?100:11*i
		this.updateValue({nativeEvent:null}, val)
		this.animate({h:this.color.h,s:this.color.s,v:val}, 'v')
	}
	onSquareLayout = (e) => {
		let {x, y, width, height} = e.nativeEvent.layout
		this.wheelWidth = Math.min(width, height)
		this.tryForceUpdate()
	}
	onWheelLayout = (e) => {
		/*
		* const {x, y, width, height} = nativeEvent.layout
		* onlayout values are different than measureInWindow
		* x and y are the distances to its previous element
		* but in measureInWindow they are relative to the window
		*/
		this.wheel.measureInWindow((x, y, width, height) => {
			this.wheelMeasure = {x, y, width, height}
			this.wheelSize = width
			// this.panX.setOffset(-width/2)
			// this.panY.setOffset(-width/2)
			this.update(this.state.currentColor)
			this.setState({wheelOpacity:1})
		})
	}
	onSliderLayout = (e) => {
		this.slider.measureInWindow((x, y, width, height) => {
			this.sliderMeasure = {x, y, width, height}
			this.sliderLength = this.props.row ? height-width : width-height
			// this.slideX.setOffset(-width/2)
			// this.slideY.setOffset(-width/2)
			this.update(this.state.currentColor)
			this.setState({sliderOpacity:1})
		})
	}
	outOfBox (measure, gestureState) {
		const { x, y, width, height } = measure
		const { moveX, moveY, x0, y0 } = gestureState
		// console.log(`${moveX} , ${moveY} / ${x} , ${y} / ${locationX} , ${locationY}`);
		return !(moveX >= x && moveX <= x+width && moveY >= y && moveY <= y+height)
	}
	outOfWheel (nativeEvent) {
		const {radius} = this.polar(nativeEvent)
		return radius > 1
	}
	outOfSlider (nativeEvent) {
		const row = this.props.row
		const loc = row ? nativeEvent.locationY : nativeEvent.locationX
		const {width,height} = this.sliderMeasure
		return (loc > (row ? height-width : width-height))
	}
	val (v) {
		const d = this.props.discrete, r = 11*Math.round(v/11)
		return d ? (r>=99?100:r) : v
	}
	ratio (nativeEvent) {
		const row = this.props.row
		const loc = row ? nativeEvent.locationY : nativeEvent.locationX
		const {width,height} = this.sliderMeasure
		return 1 - (loc / (row ? height-width : width-height))
	}
	polar (nativeEvent) {
		const lx = nativeEvent.locationX, ly = nativeEvent.locationY
		const [x, y] = [lx - this.wheelSize/2, ly - this.wheelSize/2]
		return {
			deg: Math.atan2(y, x) * (-180 / Math.PI),
			radius: Math.sqrt(y * y + x * x) / (this.wheelSize / 2),
		}
	}
	cartesian (deg, radius) {
		const r = radius * this.wheelSize / 2 // was normalized
		const rad = Math.PI * deg / 180
		const x = r * Math.cos(rad)
		const y = r * Math.sin(rad)
		return {
			left: this.wheelSize / 2 + x,
			top: this.wheelSize / 2 - y,
		}
	}
	updateHueSaturation = ({nativeEvent}) => {
		const {deg, radius} = this.polar(nativeEvent), h = deg, s = 100 * radius, v = this.color.v
		// if(radius > 1 ) return
		const hsv = {h,s,v}
		const currentColor = hsv2Hex(hsv)
		this.color = hsv
		this.setState({hsv, currentColor, hueSaturation: hsv2Hex(this.color.h,this.color.s,100)})
		this.props.onColorChange(hsv2Hex(hsv))
		// this.testData.deg = deg
		// this.testData.radius = radius
		// this.testData.pan = JSON.stringify({x:this.panX,y:this.panY})
		// this.testData.pan = JSON.stringify(this.state.pan.getTranslateTransform())
		// this.testView.forceUpdate()
	}
	updateValue = ({nativeEvent}, val) => {
		const {h,s} = this.color, v = (typeof val == 'number') ? val : 100 * this.ratio(nativeEvent)
		const hsv = {h,s,v}
		const currentColor = hsv2Hex(hsv)
		this.color = hsv
		this.setState({hsv, currentColor, hueSaturation: hsv2Hex(this.color.h,this.color.s,100)})
		this.props.onColorChange(hsv2Hex(hsv))
	}
	update = (color, who, max, force) => {
		const specific = (typeof who == 'string'), who_hs = (who=='hs'), who_v = (who=='v')
		let {h, s, v} = (typeof color == 'string') ? hex2Hsv(color) : color, stt = {}
		h = (who_hs||!specific) ? h : this.color.h
		s = (who_hs && max) ? 100 : (who_hs && max===false) ? 0 : (who_hs||!specific) ? s : this.color.s
		v = (who_v && max) ? 100 : (who_v && max===false) ? 0 : (who_v||!specific) ? v : this.color.v
		const range = (100 - v) / 100 * this.sliderLength
		const {left, top} = this.cartesian(h, s / 100)
		const hsv = {h,s,v}
		if(!specific||force) {
			this.color = hsv
			stt.hueSaturation = hsv2Hex(this.color.h,this.color.s,100)
			// this.setState({hueSaturation: hsv2Hex(this.color.h,this.color.s,100)})
		}
		stt.currentColor = hsv2Hex(hsv)
		this.setState(stt, x=>{ this.tryForceUpdate(); this.renderDiscs(); })
		// this.setState({currentColor:hsv2Hex(hsv)}, x=>this.tryForceUpdate())
		this.props.onColorChange(hsv2Hex(hsv))
		if (this.props.onColorChangeComplete) this.props.onColorChangeComplete(hsv2Hex(hsv))
		if(who_hs||!specific) {
			this.panY.setValue(top)// - this.props.thumbSize / 2)
			this.panX.setValue(left)// - this.props.thumbSize / 2)
		}
		if(who_v||!specific) {
			this.slideX.setValue(range)
			this.slideY.setValue(range)
		}
	}
	animate = (color, who, max, force) => {
		const specific = (typeof who == 'string'), who_hs = (who=='hs'), who_v = (who=='v')
		let {h, s, v} = (typeof color == 'string') ? hex2Hsv(color) : color, stt = {}
		h = (who_hs||!specific) ? h : this.color.h
		s = (who_hs && max) ? 100 : (who_hs && max===false) ? 0 : (who_hs||!specific) ? s : this.color.s
		v = (who_v && max) ? 100 : (who_v && max===false) ? 0 : (who_v||!specific) ? v : this.color.v
		const range = (100 - v) / 100 * this.sliderLength
		const {left, top} = this.cartesian(h, s / 100)
		const hsv = {h,s,v}
		// console.log(hsv);
		if(!specific||force) {
			this.color = hsv
			stt.hueSaturation = hsv2Hex(this.color.h,this.color.s,100)
			// this.setState({hueSaturation: hsv2Hex(this.color.h,this.color.s,100)})
		}
		stt.currentColor = hsv2Hex(hsv)
		this.setState(stt, x=>{ this.tryForceUpdate(); this.renderDiscs(); })
		// this.setState({currentColor:hsv2Hex(hsv)}, x=>this.tryForceUpdate())
		this.props.onColorChange(hsv2Hex(hsv))
		if (this.props.onColorChangeComplete) this.props.onColorChangeComplete(hsv2Hex(hsv))
		let anims = []
		if(who_hs||!specific) anims.push(//{//
			Animated.spring(this.panX, { toValue: left, friction: 90 }),//.start()//
			Animated.spring(this.panY, { toValue: top, friction: 90 }),//.start()//
		)//}//
		if(who_v||!specific) anims.push(//{//
			Animated.spring(this.slideX, { toValue: range, friction: 90 }),//.start()//
			Animated.spring(this.slideY, { toValue: range, friction: 90 }),//.start()//
		)//}//
		Animated.parallel(anims).start()
	}
	// componentWillReceiveProps(nextProps) {
	// 	const { color } = nextProps
	// 	if(color !== this.props.color) this.animate(color)
	// }
	revert() {
		if(this.mounted) this.animate(this.props.color)
	}
	tryForceUpdate () {
		if(this.mounted) this.forceUpdate()
	}
	renderSwatches () {
		this.swatches = PALLETE.map((c,i) => (
			<View style={[ss.swatch,{backgroundColor:c}]} key={'S'+i}>
				<TouchableWithoutFeedback onPress={x=>this.onSwatchPress(c,i)}>
					<Animated.View style={[ss.swatchTouch,{backgroundColor:c,transform:[{scale:this.swatchAnim[i].interpolate({inputRange:[0,0.5,1],outputRange:[0.666,1,0.666]})}]}]} />
				</TouchableWithoutFeedback>
			</View>
		))
	}
	renderDiscs () {
		this.disc = (`1`).repeat(10).split('').map((c,i) => (
			<View style={[ss.swatch,{backgroundColor:this.state.hueSaturation}]} key={'D'+i}>
				<TouchableWithoutFeedback onPress={x=>this.onDiscPress(c,i)}>
					<Animated.View style={[ss.swatchTouch,{backgroundColor:this.state.hueSaturation,transform:[{scale:this.discAnim[i].interpolate({inputRange:[0,0.5,1],outputRange:[0.666,1,0.666]})}]}]}>
						<View style={[ss.wheelImg,{backgroundColor:'#000',opacity:1-(i>=9?1:(i*11/100))}]}></View>
					</Animated.View>
				</TouchableWithoutFeedback>
			</View>
		)).reverse()
		this.tryForceUpdate()
	}
	render () {
		const {
			style,
			thumbSize,
			sliderSize,
			swatchesLast,
			swatchesOnly,
			discrete,
			row,
		} = this.props
		const swatches = !!(this.props.swatches || swatchesOnly)
		const hsv = hsv2Hex(this.color), hex = hsv2Hex(this.color.h,this.color.s,100)
		const wheelPanHandlers = this.wheelPanResponder && this.wheelPanResponder.panHandlers || {}
		const sliderPanHandlers = this.sliderPanResponder && this.sliderPanResponder.panHandlers || {}
		const opacity = this.state.wheelOpacity// * this.state.sliderOpacity
		const margin = swatchesOnly ? 0 : 16
		const wheelThumbStyle = {
			width: thumbSize,
			height: thumbSize,
			borderRadius: thumbSize / 2,
			backgroundColor: hsv,
			transform: [{translateX:-thumbSize/2},{translateY:-thumbSize/2}],
			left: this.panX,
			top: this.panY,
			opacity,
			////
			// transform: [{translateX:this.panX},{translateY:this.panY}],
			// left: -this.props.thumbSize/2,
			// top: -this.props.thumbSize/2,
			// zIndex: 2,
		}
		const sliderThumbStyle = {
			left: row?0:this.slideX,
			top: row?this.slideY:0,
			// transform: [row?{translateX:8}:{translateY:8}],
			backgroundColor: hex,
			borderRadius: sliderSize/2,
			height: sliderSize,
			width: sliderSize,
			opacity,
		}
		const sliderStyle = {
			width:row?sliderSize:'100%',
			height:row?'100%':sliderSize,
			marginLeft:row?16:0,
			marginTop:row?0:16,
			borderRadius:sliderSize/2,
		}
		const swatchStyle = {
			flexDirection:row?'column':'row',
			width:row?20:'100%',
			height:row?'100%':20,
			marginLeft:row?margin:0,
			marginTop:row?0:margin,
		}
		const swatchFirstStyle = {
			marginTop:0,
			marginLeft:0,
			marginRight:row?margin:0,
			marginBottom:row?0:margin,
		}
		// console.log('RENDER >>',row,thumbSize,sliderSize)
		return (
			<View style={[ss.root,row?{flexDirection:'row'}:{},style]}>
				{ swatches && !swatchesLast && <View style={[ss.swatches,swatchStyle,swatchFirstStyle]} key={'SW'}>{ this.swatches }</View> }
				{ !swatchesOnly && <View style={[ss.wheel]} key={'$1'} onLayout={this.onSquareLayout}>
					{ this.wheelWidth>0 && <View style={[{padding:thumbSize/2,width:this.wheelWidth,height:this.wheelWidth}]}>
						<View style={[ss.wheelWrap]}>
							<Image style={ss.wheelImg} source={srcWheel} />
							<Animated.View style={[ss.wheelThumb,wheelThumbStyle,Elevations[4],{pointerEvents:'none'}]} />
							<View style={[ss.cover]} onLayout={this.onWheelLayout} {...wheelPanHandlers} ref={r => { this.wheel = r }}></View>
						</View>
					</View> }
				</View> }
				{ !swatchesOnly && (discrete ? <View style={[ss.swatches,swatchStyle]} key={'$2'}>{ this.disc }</View> : <View style={[ss.slider,sliderStyle]} key={'$2'}>
					<View style={[ss.grad,{backgroundColor:hex}]}>
						<Image style={ss.sliderImg} source={row?srcSliderRotated:srcSlider} resizeMode="stretch" />
					</View>
					<Animated.View style={[ss.sliderThumb,sliderThumbStyle,Elevations[4],{pointerEvents:'none'}]} />
					<View style={[ss.cover]} onLayout={this.onSliderLayout} {...sliderPanHandlers} ref={r => { this.slider = r }}></View>
				</View>) }
				{ swatches && swatchesLast && <View style={[ss.swatches,swatchStyle]} key={'SW'}>{ this.swatches }</View> }
			</View>
		)
	}
}

const ss = StyleSheet.create({
	root: {
		flex: 1,
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'space-between',
		overflow: 'visible',
		// aspectRatio: 1,
		// backgroundColor: '#ffcccc',
	},
	wheel: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		position: 'relative',
		overflow: 'visible',
		width: '100%',
		minWidth: 200,
		minHeight: 200,
		// aspectRatio: 1,
		// backgroundColor: '#ffccff',
	},
	wheelWrap: {
		width: '100%',
		height: '100%',
		// backgroundColor: '#ffffcc',
	},
	wheelImg: {
		width: '100%',
		height: '100%',
		// backgroundColor: '#ffffcc',
	},
	wheelThumb: {
		position: 'absolute',
		backgroundColor: '#EEEEEE',
		borderWidth: 3,
		borderColor: '#EEEEEE',
		elevation: 4,
		shadowColor: 'rgb(46, 48, 58)',
		shadowOffset: {width: 0, height: 2},
		shadowOpacity: 0.8,
		shadowRadius: 2,
	},
	cover: {
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		// backgroundColor: '#ccccff88',
	},
	slider: {
		width: '100%',
		// height: 32,
		marginTop: 16,
		// overflow: 'hidden',
		flexDirection: 'column-reverse',
		// elevation: 4,
		// backgroundColor: '#ccccff',
	},
	sliderImg: {
		width: '100%',
		height: '100%',
	},
	sliderThumb: {
		position: 'absolute',
		top: 0,
		left: 0,
		borderWidth: 2,
		borderColor: '#EEEEEE',
		elevation: 4,
		// backgroundColor: '#f00',
	},
	grad: {
		borderRadius: 100,
		overflow: "hidden",
		height: '100%',
	},
	swatches: {
		width: '100%',
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 16,
		// padding: 16,
	},
	swatch: {
		width: 20,
		height: 20,
		borderRadius: 10,
		// borderWidth: 1,
		borderColor: '#8884',
		alignItems: 'center',
		justifyContent: 'center',
		overflow: 'visible',
	},
	swatchTouch: {
		width: 30,
		height: 30,
		borderRadius: 15,
		backgroundColor: '#f004',
		overflow: 'hidden',
	},
})
