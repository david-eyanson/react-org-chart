const animationDuration = 350
const shouldResize = true

// Nodes
const nodeWidth = 60
const nodeHeight = 55
const nodeSpacing = 20
const nodePaddingX = 10
const nodePaddingY = 15
const avatarWidth = 48
const nodeBorderRadius = 15
const margin = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 20,
}

// Lines
const lineType = 'angle'
const lineDepthY = 120 /* Height of the line for child nodes */

// Colors
const backgroundColor = '#B19CD9'
const borderColor = 'gray' //'#c9c9c9'
const nameColor = '#222d38'
const titleColor = '#617080'
const reportsColor = '#92A0AD'
const depthChart = []

const config = {
  margin,
  animationDuration,
  nodeWidth,
  nodeHeight,
  nodeSpacing,
  nodePaddingX,
  nodePaddingY,
  nodeBorderRadius,
  avatarWidth,
  lineType,
  lineDepthY,
  backgroundColor,
  borderColor,
  nameColor,
  titleColor,
  reportsColor,
  shouldResize,
  depthChart,
}

module.exports = config
