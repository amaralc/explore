// @ts-nocheck

import * as d3 from 'd3';
import { forwardRef, useEffect } from 'react';
import { INode } from './types';

export const CladogramChart = forwardRef(
  ({ node, selectChartElement }: { node: INode; selectChartElement: () => HTMLDivElement | null }, ref) => {
    const width = 954;
    const outerRadius = width / 2;
    const innerRadius = outerRadius - 170;

    const color = d3
      .scaleOrdinal()
      .domain(['Soft Skills', 'Technical Skills', 'Frontend', 'Backend', 'DevOps', 'Shared Skills'])
      .range(d3.schemeCategory10);

    function maxLength(d: d3.HierarchyNode<INode>) {
      const mLength = d.data.length + (d.children ? d3.max(d.children, maxLength) : 0);
      return mLength;
    }

    function setRadius(d: d3.HierarchyNode<INode> & { radius?: number }, y0: number, k: number) {
      d.radius = (y0 += d.data.length) * k;
      if (d.children) d.children.forEach((d) => setRadius(d, y0, k));
    }

    function setColor(d: d3.HierarchyNode<INode> & { color: unknown }) {
      const name = d.data.name;
      d.color = color.domain().indexOf(name) >= 0 ? color(name) : d.parent ? d.parent.color : null;
      if (d.children) d.children.forEach(setColor);
    }

    function linkVariable(d: d3.HierarchyNode<INode>) {
      return linkStep(d.source.x, d.source.radius, d.target.x, d.target.radius);
    }

    function linkConstant(d: d3.HierarchyNode<INode>) {
      return linkStep(d.source.x, d.source.y, d.target.x, d.target.y);
    }

    function linkExtensionVariable(d: d3.HierarchyNode<INode>) {
      return linkStep(d.target.x, d.target.radius, d.target.x, innerRadius);
    }

    function linkExtensionConstant(d: d3.HierarchyNode<INode>) {
      return linkStep(d.target.x, d.target.y, d.target.x, innerRadius);
    }

    function linkStep(startAngle: number, startRadius: number, endAngle: number, endRadius: number) {
      const c0 = Math.cos((startAngle = ((startAngle - 90) / 180) * Math.PI));
      const s0 = Math.sin(startAngle);
      const c1 = Math.cos((endAngle = ((endAngle - 90) / 180) * Math.PI));
      const s1 = Math.sin(endAngle);
      return (
        'M' +
        startRadius * c0 +
        ',' +
        startRadius * s0 +
        (endAngle === startAngle
          ? ''
          : 'A' +
            startRadius +
            ',' +
            startRadius +
            ' 0 0 ' +
            (endAngle > startAngle ? 1 : 0) +
            ' ' +
            startRadius * c1 +
            ',' +
            startRadius * s1) +
        'L' +
        endRadius * c1 +
        ',' +
        endRadius * s1
      );
    }

    function legend(svg: d3.Selection<SVGSVGElement, undefined, null, undefined>) {
      const g = svg
        .selectAll('g')
        .data(color.domain())
        .join('g')
        .attr('transform', (d, i) => `translate(${-outerRadius},${-outerRadius + i * 20})`);

      g.append('rect').attr('width', 18).attr('height', 18).attr('fill', color);

      g.append('text')
        .attr('x', 24)
        .attr('y', 9)
        .attr('dy', '0.35em')
        .text((d) => d);
    }

    function mouseovered(active: boolean) {
      if (!active) {
        return function (event, d) {
          d3.select(this).classed('label--active', active);
          d3.select(d.linkExtensionNode).classed('link-extension--active', active).raise();

          do {
            d3.select(d.linkNode).classed('link--active', active).raise();
            d3.select(d.foreignNode)
              .selectAll('div')
              .classed('subtree-label--active', false)
              .classed('subtree-label--inactive', true);
          } while ((d = d.parent));
        };
      }

      return function (event, d) {
        d3.select(this).classed('label--active', active);
        d3.select(d.linkExtensionNode).classed('link-extension--active', active).raise();

        do {
          d3.select(d.linkNode).classed('link--active', active).raise();
          d3.select(d.foreignNode)
            .selectAll('div')
            .classed('subtree-label--active', true)
            .classed('subtree-label--inactive', false);
        } while ((d = d.parent));
      };
    }

    function getTextWidth({ text, fontSize }: { text: string; fontSize: number | string }) {
      // Create a canvas element
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      // Set the font size
      context.font = fontSize + 'px Arial'; // You can change "Arial" to any other font you are using

      // Measure the text width
      const metrics = context.measureText(text);
      return metrics.width;
    }

    function update({ drawBranchLength, linkExtension, link, linkExtensionVariable, linkVariable }) {
      const t = d3.transition().duration(750);
      linkExtension.transition(t).attr('d', drawBranchLength ? linkExtensionVariable : linkExtensionConstant);
      link.transition(t).attr('d', drawBranchLength ? linkVariable : linkConstant);
    }

    useEffect(() => {
      const root = d3
        .hierarchy(node, (d) => d.branchset)
        .sum((d) => (d.branchset ? 0 : 1))
        .sort((a, b) => {
          if (a.value && b.value) {
            return a.value - b.value;
          }
          return d3.ascending(a, b);
        });

      d3
        .cluster<INode>()
        .size([360, innerRadius])
        .separation((a, b) => 1)(root);
      const length = root.length || 0;
      const k = innerRadius / maxLength(root);
      setRadius(root, length, k);
      setColor(root);

      const currentRef = selectChartElement();
      if (currentRef?.firstChild === null) {
        const svg = d3
          .select(currentRef)
          .append('svg')
          .attr('viewBox', [-outerRadius, -outerRadius, width, width])
          .attr('font-family', 'sans-serif')
          .attr('font-size', 10);

        svg.append('g').call(legend).append();
        svg.append('style').text(`
            .link--active { stroke: #000 !important; stroke-width: 1.5px; }
            .link-extension--active { stroke-opacity: .6; }
            .label--active { font-weight: bold; }
            .subtree-label--active { opacity: 1;}
            .subtree-label--inactive { opacity: 0;}
          `);

        const linkExtension = svg
          .append('g')
          .attr('fill', 'none')
          .attr('stroke', '#000')
          .attr('stroke-opacity', 0.25)
          .selectAll('path')
          .data(root.links().filter((d) => !d.target.children))
          .join('path')
          .each(function (d) {
            d.target.linkExtensionNode = this;
          })
          .attr('d', linkExtensionConstant);

        const link = svg
          .append('g')
          .attr('fill', 'none')
          .attr('stroke', '#000')
          .selectAll('path')
          .data(root.links())
          .join('path')
          .each(function (d) {
            d.target.linkNode = this;
          })
          .attr('d', linkConstant)
          .attr('stroke', (d) => d.target.color);

        svg
          .append('g')
          .selectAll('text')
          .data(root.leaves())
          .join('text')
          .attr('dy', '.31em')
          .attr('transform', (d) => {
            const maximumBranchDepth = d.descendants().reduce((acc, curr) => Math.max(acc, curr.depth), 0);
            let rotation = 0;
            let translation = innerRadius + 4;
            if (d.depth < maximumBranchDepth && d.parent) {
              translation = d.y - (d.y - d.parent.y) / 2;
              rotation = d.x < 90 || (d.x > 180 && d.x < 270) ? 90 : -90;
            }
            const css = `rotate(${d.x - 90}) translate(${translation},0)${
              d.x < 180 ? '' : ' rotate(180)'
            } rotate(${rotation})`;
            return css;
          })
          .attr('text-anchor', (d) => {
            const maximumBranchDepth = d.descendants().reduce((acc, curr) => Math.max(acc, curr.depth), 0);
            return d.depth < maximumBranchDepth && d.parent ? 'middle' : d.x < 180 ? 'start' : 'end';
          })
          .text((d) => {
            const maximumBranchDepth = d.descendants().reduce((acc, curr) => Math.max(acc, curr.depth), 0);
            if (d.depth === maximumBranchDepth) {
              return d.data.name.replace(/_/g, ' ');
            }
          })
          .each(function (d) {
            const maximumBranchDepth = d.descendants().reduce((acc, curr) => Math.max(acc, curr.depth), 0);
            if (d.depth < maximumBranchDepth && d.parent) {
              const text = d3.select(this);
              const words = d.data.name.replace(/_/g, ' ').split(' ');
              words.forEach((word, i) => {
                text
                  .append('tspan')
                  .attr('x', 0)
                  .attr('dy', i === 0 ? 0 : '1em') // Adjust '1em' to change the line height
                  .text(word);
              });
            }
          })
          .on('mouseover', mouseovered(true))
          .on('mouseout', mouseovered(false));
        svg
          .append('g')
          .selectAll('foreignObject')
          .data(root.descendants().filter((d) => d.children && d.parent))
          .join('foreignObject')
          .each(function (d) {
            d.foreignNode = this;
          })
          .attr('dy', '.31em')
          .attr('transform', (d) => {
            const maximumBranchDepth = d.descendants().reduce((acc, curr) => Math.max(acc, curr.depth), 0);
            let rotation = 0;
            let translation = innerRadius + 4;
            if (d.depth < maximumBranchDepth && d.parent) {
              translation = d.y - (d.y - d.parent.y) / 2;
              rotation = d.x < 90 || (d.x > 180 && d.x < 270) ? 90 : -90;
            }
            const countLines = d.data.name.replace(/_/g, ' ').split(' ').length;
            const words = d.data.name.replace(/_/g, ' ').split(' ');
            const maxWidth = words.reduce((max, word) => {
              const width = getTextWidth({ text: word, fontSize: 8 }); // Get the width of each word
              return Math.max(max, width);
            }, 0);
            const css = `rotate(${d.x - 90}) translate(${translation},0)${
              d.x < 180 ? '' : ' rotate(180)'
            } rotate(${rotation}) translate(-${(maxWidth + 20) / 2}, -${(countLines / 2 + 1) * 8})`; // Center the div (half of width and height)
            return css;
          })
          .attr('text-anchor', (d) => {
            const maximumBranchDepth = d.descendants().reduce((acc, curr) => Math.max(acc, curr.depth), 0);
            return d.depth < maximumBranchDepth && d.parent ? 'middle' : d.x < 180 ? 'start' : 'end';
          })
          .attr('width', (d) => {
            const words = d.data.name.replace(/_/g, ' ').split(' ');
            const maxWidth = words.reduce((max, word) => {
              const width = getTextWidth({ text: word, fontSize: 8 }); // Get the width of each word
              return Math.max(max, width);
            }, 0);
            return maxWidth + 20; // Add some padding
          })
          .attr('height', 100) // Adjust the height as necessary
          .append('xhtml:div')
          .style('background', 'rgba(255, 255, 255, 0.9)')
          .style('border', '1px solid black')
          .style('border-radius', '4px')
          .style('padding', '2px') // Adjust padding as necessary
          .style('text-align', 'center') // Center align text within the div
          .html((d) => {
            const maximumBranchDepth = d.descendants().reduce((acc, curr) => Math.max(acc, curr.depth), 0);
            if (d.depth === maximumBranchDepth) {
              return d.data.name.replace(/_/g, ' ');
            }
            const textDivs = d.data.name
              .replace(/_/g, ' ')
              .split(' ')
              .map((word, i) => `<div style="margin-top: ${i === 0 ? 0 : '0.5em'};">${word}</div>`)
              .join('');
            const wrapperDiv = `<div style="line-height: 0.75em;">${textDivs}</div>`;
            return wrapperDiv;
          })
          .classed('subtree-label--inactive', true);

        update({ drawBranchLength: false, linkExtension, link, linkExtensionVariable, linkVariable });
      }
    });

    console.log(null);

    return null;
  },
);
