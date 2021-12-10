const d3 = require('d3')
const { wrapText, helpers, covertImageToBase64 } = require('../utils')
const renderLines = require('./renderLines')
const exportOrgChartImage = require('./exportOrgChartImage')
const exportOrgChartPdf = require('./exportOrgChartPdf')
const onClick = require('./onClick')
const iconLink = require('./components/iconLink')
const supervisorIcon = require('./components/supervisorIcon')
const CHART_NODE_CLASS = 'org-chart-node'
const PERSON_LINK_CLASS = 'org-chart-person-link'
const PERSON_NAME_CLASS = 'org-chart-person-name'
const PERSON_TITLE_CLASS = 'org-chart-person-title'
const PERSON_HIGHLIGHT = 'org-chart-person-highlight'
const PERSON_REPORTS_CLASS = 'org-chart-person-reports'
const GENERIC_HEADER_CLASS = 'org-chart-generic-header'

const canvas = document.createElement('canvas'),
  context = canvas.getContext('2d')

function calculateDepth(depth, depthChart) {
  if (depth === 0) return 0
  let calculatedDepth = 0
  for (let i = 0; i < depth; i++) {
    calculatedDepth += Math.ceil(depthChart[i])
  }
  return calculatedDepth
}

function render(config) {
  const {
    svgroot,
    svg,
    tree,
    animationDuration,
    nodeWidth,
    nodeHeight,
    nodePaddingX,
    nodePaddingY,
    nodeBorderRadius,
    backgroundColor,
    nameColor,
    titleColor,
    reportsColor,
    borderColor,
    avatarWidth,
    lineDepthY,
    treeData,
    sourceNode,
    onPersonLinkClick,
    loadImage,
    downloadImageId,
    downloadPdfId,
    elemWidth,
    margin,
    onConfigChange,
  } = config

  // Compute the new tree layout.
  const nodes = tree.nodes(treeData).reverse()
  const links = tree.links(nodes)

  config.links = links
  config.nodes = nodes

  // Normalize for fixed-depth.
  nodes.forEach(function (d) {
    d.y = calculateDepth(d.depth, config.depthChart)
  })

  // Update the nodes
  const node = svg.selectAll('g.' + CHART_NODE_CLASS).data(
    nodes.filter((d) => d.id),
    (d) => d.id
  )

  const parentNode = sourceNode || treeData

  svg.selectAll('#supervisorIcon').remove()

  supervisorIcon({
    svg: svg,
    config,
    treeData,
    x: 70,
    y: -24,
  })

  // Enter any new nodes at the parent's previous position.
  const nodeEnter = node
    .enter()
    .insert('g')
    .attr('class', CHART_NODE_CLASS)
    .attr('transform', `translate(${parentNode.x0}, ${parentNode.y0})`)
    .on('click', onClick(config))

  const namePos = {
    x: nodeWidth / 2,
    // y: nodePaddingY * 1.8 + avatarWidth,
    y: nodePaddingY,
  }

  // .on('click', onParentClick(config))

  // Person Card Shadow
  nodeEnter
    .append('rect')
    .attr('width', nodeWidth)
    .attr('class', 'shadow')
    //  .attr('height', (d) => {
    //    return nodeHeight
    //context.font = '14px Arial'
    //console.log('C WIDTH', context.measureText(d.person.name).width)
    //return 150 + (16 * context.measureText(d.person.name).width) / 150
    //  })
    .attr('height', nodeHeight)
    .attr('fill', backgroundColor)
    .attr('stroke', borderColor)
    .attr('rx', nodeBorderRadius)
    .attr('ry', nodeBorderRadius)
    .attr('fill-opacity', 0.05)
    .attr('stroke-opacity', 0.025)
    .attr('filter', 'url(#boxShadow)')

  // Person Card Container
  nodeEnter
    .append('rect')
    .attr('class', (d) => (d.isHighlight ? `${PERSON_HIGHLIGHT} box` : 'box'))
    .attr('width', nodeWidth)
    //.attr('height', (d) => {
    //  return nodeHeight
    //context.font = '14px Arial'
    //console.log('C WIDTH', context.measureText(d.person.name).width)
    //return 150 + (16 * context.measureText(d.person.name).width) / 150
    //})
    .attr('height', nodeHeight)
    .attr('id', (d) => d.id)
    .attr('fill', backgroundColor)
    .attr('stroke', borderColor)
    .attr('rx', nodeBorderRadius)
    .attr('ry', nodeBorderRadius)
    .style('cursor', helpers.getCursorForNode)

  let radius = 16
  nodeEnter
    .append('circle')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', radius)
    .style('fill', 'gray')

  nodeEnter
    .append('text')
    .attr('x', -7)
    .attr('width', '40px')
    .attr('y', 2)
    .attr('dy', '.3em')
    //.attr('height', (d) => d.person.height)
    .attr('height', 20)
    .style('cursor', 'pointer')
    .style('fill', 'white')
    .style('font-size', 12)
    .text((d) => {
      return d.person.count
    })

  // Node Label
  nodeEnter
    .append('text')
    .attr('class', GENERIC_HEADER_CLASS + ' unedited')
    .attr('width', nodeWidth)
    .attr('y', namePos.y)
    .attr('dy', '.3em')
    //.attr('height', (d) => d.person.height)
    .attr('height', nodeHeight)
    .style('cursor', 'pointer')
    .style('fill', nameColor)
    .style('font-size', 10)
    .text((d) => {
      return d.person.title
      //return d.person.name
    })
    .attr('x', function (d) {
      return nodeWidth - Math.ceil(this.getBBox().width) - 5
    })
  // Wrap the title texts
  const wrapWidth = nodeWidth - 10
  // Node Label
  nodeEnter
    .append('text')
    .attr('class', PERSON_TITLE_CLASS + ' unedited')
    .attr('x', namePos.x)
    .attr('width', nodeWidth)
    .attr('y', namePos.y + 20)
    .attr('dy', '.3em')
    //.attr('height', (d) => d.person.height)
    .attr('height', nodeHeight)
    .style('cursor', 'pointer')
    .style('fill', nameColor)
    .style('font-size', 10)
    .text((d) => {
      //return 'Basic Queue'
      return d.person.name
    })

  const heightForTitle = 30 // getHeightForText(d.person.title)

  /*--
  // Person's Name
  nodeEnter
    .append('text')
    .attr('class', PERSON_NAME_CLASS + ' unedited')
    .attr('x', namePos.x)
    .attr('width', '225px')
    .attr('y', namePos.y)
    .attr('dy', '.3em')
    //.attr('height', (d) => d.person.height)
    .attr('height', nodeHeight)
    .style('cursor', 'pointer')
    .style('fill', nameColor)
    .style('font-size', 14)
    .text((d) => {
      return d.person.name
    })
--*/
  //const heightForTitle = 60 // getHeightForText(d.person.title)

  // Person's Reports
  nodeEnter
    .append('text')
    .attr('class', PERSON_REPORTS_CLASS + ' reports')
    .attr('x', 10)
    .attr('y', namePos.y + 25)
    .attr('dy', '.9em')
    .style('font-size', 10)
    .style('font-weight', 400)
    .style('cursor', 'pointer')
    .style('color', 'white')
    .style('fill', 'white')
    .text(helpers.getTextForTitle)
  /*--
  // Person's Link
  const nodeLink = nodeEnter
    .append('a')
    .attr('class', PERSON_LINK_CLASS)
    .attr('display', (d) => (d.person.link ? '' : 'none'))
    .attr('xlink:href', (d) => d.person.link)
    .on('click', (datum) => {
      d3.event.stopPropagation()
      // TODO: fire link click handler
      if (onPersonLinkClick) {
        onPersonLinkClick(datum, d3.event)
      }
    })
--*/
  /*--
  iconLink({
    svg: nodeLink,
    x: nodeWidth - 20,
    y: 8,
  })
--*/
  // Transition nodes to their new position.
  const nodeUpdate = node
    .transition()
    .duration(animationDuration)
    .attr('transform', (d) => `translate(${d.x},${d.y})`)

  nodeUpdate
    .select('rect.box')
    .attr('fill', backgroundColor)
    .attr('stroke', borderColor)

  // Transition exiting nodes to the parent's new position.
  const nodeExit = node
    .exit()
    .transition()
    .duration(animationDuration)
    .attr('transform', (d) => `translate(${parentNode.x},${parentNode.y})`)
    .remove()

  // Update the links
  const link = svg.selectAll('path.link').data(links, (d) => d.target.id)

  //svg.selectAll('text.unedited.' + PERSON_NAME_CLASS).call(wrapText, wrapWidth)
  svg.selectAll('text.unedited.' + PERSON_TITLE_CLASS).call(wrapText, wrapWidth)

  nodeUpdate.selectAll('rect.box').attr('height', function (d) {
    if (!d.rendered) {
      console.log('GGG Whic')
      let height = this.parentNode.getBBox().height + nodePaddingY - radius
      if (!config.depthChart[d.depth]) {
        console.log('AAA Scen')
        config.depthChart[d.depth] = height + margin.bottom
      } else if (config.depthChart[d.depth] < height) {
        console.log('BBB Scen')
        config.depthChart[d.depth] = height + margin.bottom
      }
      d.rendered = true
      console.log('returned Height', height)
      d.trueHeight = height
      return height
    } else {
      console.log('D is', d)
      return d.trueHeight
    }
  })

  nodeUpdate.selectAll('rect.shadow').attr('height', function (d) {
    return d.trueHeight
      ? d.trueHeight
      : this.parentNode.getBBox().height + nodePaddingY
  })

  nodeUpdate.selectAll('text.reports').attr('y', function (d) {
    return d.trueHeight
      ? d.trueHeight - 15
      : this.parentNode.getBBox().height - 15
  })

  // Render lines connecting nodes
  renderLines(config)

  // Stash the old positions for transition.
  nodes.forEach(function (d) {
    d.x0 = d.x
    d.y0 = d.y - 8
  })

  var nodeLeftX = -80
  var nodeRightX = 70
  var nodeY = 180
  nodes.map((d) => {
    nodeLeftX = d.x < nodeLeftX ? d.x : nodeLeftX
    nodeRightX = d.x > nodeRightX ? d.x : nodeRightX
    nodeY = d.y > nodeY ? d.y : nodeY
  })

  config.nodeRightX = nodeRightX
  config.nodeY = nodeY
  config.nodeLeftX = nodeLeftX * -1

  d3.select(downloadImageId).on('click', function () {
    exportOrgChartImage(config)
  })

  d3.select(downloadPdfId).on('click', function () {
    exportOrgChartPdf(config)
  })
  onConfigChange(config)
}
module.exports = render
