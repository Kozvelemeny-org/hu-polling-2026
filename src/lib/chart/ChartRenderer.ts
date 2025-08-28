import * as d3 from "d3";
import type { DayData, AxisParams, Party, PollData, Annotation, SeriesDescriptor, SeriesDaily, SeriesPoint } from "../types";
import { partyData } from "$stores/dataStore";

interface ChartContext {
    x: d3.ScaleTime<number, number>;
    y: d3.ScaleLinear<number, number>;
    width: number;
    height: number;
}

let containerSizes = {
    small: 250,
    medium: 400,
    large: Infinity,
};

let paddingSizes = {
    small: 120,
    medium: 120,
    large: 120,
};

let paddingLeftSizes = {
    small: 30,
    medium: 30,
    large: 40,
}

let partyLabelSizes = {
    small: 9,
    medium: 11,
    large: 14,
}

let dotSizes = {
    month: {
        small: 2.5,
        medium: 3,
        large: 3.5,
    },
    quarter: {
        small: 1.5,
        medium: 1.5,
        large: 3,
    },
    year: {
        small: 1,
        medium: 1.5,
        large: 2,
    }
}

let lineWidths = {
    small: 1.5,
    medium: 1.8,
    large: 2.5,
}

let gridLabelSizes = {
    small: 7,
    medium: 12,
    large: 13,
}

let verticalLineLabelSizes = {
    small: 10,
    medium: 11,
    large: 12,
}

export class ChartRenderer {
    private static instanceCounter = 0;
    private clipPathId: string;

    private renderOptions: Record<string, unknown> = {
        showDots: true,
        isInteractive: true,
        aspectRatio: 7 / 4,
        yLims: undefined,
    };

    private margin = { top: 24, right: paddingSizes['small'], bottom: 34, left: paddingSizes['small'] }

    private containerElement: HTMLElement;
    private containerSizeCategory: keyof typeof containerSizes;
    private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    private chartGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    private gridGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    private annotationGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    private dataGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    private interactionGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    private hoverLine: d3.Selection<SVGLineElement, unknown, null, undefined>;
    private tooltipGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    private mouseEventRect: d3.Selection<SVGRectElement, unknown, null, undefined>;
    private svgDefs: d3.Selection<SVGDefsElement, unknown, null, undefined>;

    private context: ChartContext;
    private pollData: PollData;
    private dailyData: DayData[];
    private selectedParties: Party[];
    private annotations: Annotation[];
    private axisParams: AxisParams;

    private seriesDescriptors: SeriesDescriptor[] = [];
    private seriesPoints: Record<string, SeriesPoint[]> = {};
    private seriesDaily: Record<string, SeriesDaily[]> = {};
    private alignedDates: Date[] = [];

    constructor(containerElement: HTMLElement) {
        this.containerSizeCategory = "large";
        this.containerElement = containerElement;

        d3.select(containerElement).selectAll("*").remove();

        this.clipPathId = `series-clip-${ChartRenderer.instanceCounter++}`;

        this.svg = d3.select(containerElement).append("svg");
        this.chartGroup = this.svg.append("g").attr("class", "chart-group");
        this.gridGroup = this.chartGroup.append("g").attr("class", "grid-group");
        this.annotationGroup = this.chartGroup.append("g").attr("class", "annotation-group");
        this.dataGroup = this.chartGroup.append("g").attr("class", "data-group");

        this.interactionGroup = this.chartGroup.append("g").attr("class", "interaction-group");
        this.hoverLine = this.interactionGroup.append("line").attr("class", "hover-line");
        this.tooltipGroup = this.interactionGroup.append("g").attr("class", "tooltip-group");
        this.mouseEventRect = this.interactionGroup.append("rect").attr("class", "interaction-overlay");
        this.svgDefs = this.svg.append("defs");

        this.pollData = [];
        this.dailyData = [];
        this.selectedParties = [];
        this.annotations = [];
        this.axisParams = {
            xTickLevel: "year",
            yLims: [0, 1],
            ticks: [0, 0.25, 0.5, 0.75],
            dateRange: { start: new Date(2018, 0, 1), end: new Date() },
        };

        this.context = {
            x: d3.scaleTime(),
            y: d3.scaleLinear(),
            width: 0,
            height: 0,
        };
    }

    private getContainerSizeCategory() {
        const width = this.containerElement.offsetWidth;

        for (const [category, size] of Object.entries(containerSizes)) {
            if (width <= size) {
                return category as keyof typeof containerSizes;
            }
        }
        return "large";
    }

    public render(
        selectedParties: Party[],
        annotations: Annotation[],
        renderOptions: Record<string, unknown> | undefined,
        dateRange?: { start: Date, end: Date },
    ) {
        this.selectedParties = selectedParties;
        this.annotations = annotations;

        if (dateRange) {
            this.axisParams.dateRange = dateRange;
        }

        if (renderOptions) this.renderOptions = { ...this.renderOptions, ...renderOptions };

        this.containerSizeCategory = this.getContainerSizeCategory();

        this.margin.left = paddingLeftSizes[this.containerSizeCategory]
        this.margin.right = paddingSizes[this.containerSizeCategory]

        this.setupChart();
        this.drawGridlines();
        this.drawAnnotations();
    }

    public updateSeries(pointsBySeries: Record<string, SeriesPoint[]>, dailyBySeries: Record<string, SeriesDaily[]>, series: SeriesDescriptor[], pollData?: PollData, dates?: Date[]) {
        if (pollData) this.pollData = pollData;
        this.seriesDescriptors = series;
        this.seriesPoints = pointsBySeries;
        this.seriesDaily = dailyBySeries;
        if (dates) this.alignedDates = dates;

        // compute right margin based on furthest last x among series
        const availableWidth = this.context.width - this.margin.right;
        const lastXs = Object.values(this.seriesDaily)
            .map(arr => {
                const a = Array.isArray(arr) ? arr : [];
                const last = a[a.length - 1];
                return last ? this.context.x(last.date) : null;
            })
            .filter((v): v is number => typeof v === 'number');
        if (lastXs.length) {
            const lastX = Math.max(...lastXs);
            if (lastX + this.margin.right < availableWidth) {
                this.margin.right = paddingLeftSizes[this.containerSizeCategory];
            } else {
                this.margin.right = lastX + this.margin.right - availableWidth;
            }
        }
        this.context.x.range([this.margin.left, this.context.width - this.margin.right]);
        this.drawGridlines();
        this.drawGenericSeries();
        if (this.renderOptions.isInteractive) {
            this.setupInteractivityForSeries(this.alignedDates);
        }
    }

    public updateAnnotations(annotations: Annotation[]) {
        this.annotations = annotations;
        this.annotationGroup.selectAll("*").remove();
        this.drawAnnotations();
    }

    public updateAxisLimits(newAxisParams: AxisParams) {
        this.axisParams = newAxisParams;
        this.context.x.domain([newAxisParams.dateRange.start, newAxisParams.dateRange.end]);
        this.context.y.domain(newAxisParams.yLims);

        this.drawGridlines();
        if (this.seriesDescriptors && this.seriesDescriptors.length > 0) {
            this.drawGenericSeries();
            if (this.renderOptions.isInteractive) {
                this.setupInteractivityForSeries();
            }
        }
        this.updateAnnotations(this.annotations);
    }

    private setupChart() {
        const { containerSizeCategory, axisParams } = this;

        const width = this.containerElement.getBoundingClientRect().width;
        const height = width / (this.renderOptions.aspectRatio as number);

        this.context = {
            x: d3.scaleTime()
                .domain([axisParams.dateRange.start, axisParams.dateRange.end])
                .range([this.margin.left, width - this.margin.right]),
            y: d3.scaleLinear()
                .domain(axisParams.yLims)
                .range([height - this.margin.bottom, this.margin.top]),
            width,
            height,
        };

        this.svg
            .attr("viewBox", `0 0 ${this.containerElement.getBoundingClientRect().width} ${height}`)
            .attr("preserveAspectRatio", "xMidYMid meet");
    }

    private drawGridlines() {
        const { x, y, width, height } = this.context;
        const { axisParams, containerSizeCategory } = this;

        this.gridGroup.selectAll("*").remove();

        const xTicks = axisParams.xTickLevel === "year"
            ? d3.timeYear.every(1)
            : axisParams.xTickLevel === "quarter"
                ? d3.timeMonth.every(3)
                : d3.timeMonth.every(1);

        const dateFormatOptions: Intl.DateTimeFormatOptions = axisParams.xTickLevel === "year"
            ? { year: "numeric" }
            : { month: "short" };

        const xGridSelection = this.gridGroup.selectAll("g.x-grid").data([null]);
        xGridSelection.join(
            enter => {
                const g = enter.append("g")
                    .attr("class", "grid x-grid")
                    .attr("transform", `translate(0,${height - this.margin.bottom})`);
                const axisBottom = d3.axisBottom(x) as any;
                g.call(
                    axisBottom
                        .ticks(xTicks as any)
                        .tickSizeInner(6)
                        .tickPadding(8)
                        .tickFormat((d: any) => {
                            const dd: Date = new Date(d as any);
                            if (axisParams.xTickLevel === 'quarter' && dd.getMonth() === 0) {
                                return dd.toLocaleDateString("hu-HU", { year: "numeric" }).replace(".", "");
                            } else {
                                return dd.toLocaleDateString("hu-HU", dateFormatOptions).replace(".", "");
                            }
                        })
                );

                // transform the labels by half the tick size if the xTickLevel is year
                if (axisParams.xTickLevel === "year") {
                    const tickSpacing = (width - this.margin.left - this.margin.right) / ((this.context.x.ticks(xTicks as any) as any[]).length - 1);
                    g.selectAll("text")
                        .attr("transform", `translate(${tickSpacing / 2}, 0)`)
                        .attr("dy", "6px")
                        .attr("text-anchor", "middle");
                }

                g.select(".domain").remove();
                g.selectAll("line")
                    .style("stroke", "#ddd")
                    .style("stroke-opacity", 1);
                g.selectAll("text")
                    .style("white-space", "pre-wrap");
                return g;
            },
            update => {
                update.attr("transform", `translate(${this.margin.top},${height - this.margin.bottom})`)
                    .call(
                        (d3.axisBottom(x) as any)
                            .ticks(xTicks as any)
                            .tickSizeInner(6)
                            .tickPadding(8)
                            .tickFormat((d: any) => {
                                const dd: Date = new Date(d as any);
                                if (axisParams.xTickLevel === 'quarter' && dd.getMonth() === 0) {
                                    return dd.toLocaleDateString("hu-HU", { year: "numeric" }).replace(".", "");
                                } else {
                                    return dd.toLocaleDateString("hu-HU", dateFormatOptions).replace(".", "");
                                }
                            })
                    );
                update.select(".domain").remove();
                update.selectAll("line")
                    .style("stroke", "#ddd")
                    .style("stroke-opacity", 1)
                update.selectAll("text")
                    .style("white-space", "pre-wrap");
                return update;
            }
        );

        const leftGridWidth = this.renderOptions.isInteractive
            ? width - this.margin.right
            : width - paddingLeftSizes[this.containerSizeCategory];

        const yLeftGridSelection = this.gridGroup.selectAll("g.y-grid-left").data([null]);
        yLeftGridSelection.join(
            enter => {
                const g = enter.append("g")
                    .attr("class", "grid y-grid y-grid-left");
                const axisLeft = d3.axisLeft(y) as any;
                (g as any).call(
                    axisLeft
                        .tickValues(axisParams.ticks)
                        .tickSize(-(leftGridWidth as number))
                        .tickFormat((d: any) => `${Math.round((d as number) * 100)}`)
                        .tickPadding(-15)
                );
                g.select(".domain").remove();
                g.selectAll("line")
                    .style("stroke", "#ddd")
                    .style("stroke-opacity", 1);
                g.style("border-bottom", "1px solid #ddd");
                return g;
            },
            update => {
                (update as any).call(
                    (d3.axisLeft(y) as any)
                        .tickValues(axisParams.ticks)
                        .tickSize(-(leftGridWidth as number))
                        .tickFormat((d: any) => `${Math.round((d as number) * 100)}`)
                        .tickPadding(-15)
                );
                update.select(".domain").remove();
                update.selectAll("line")
                    .style("stroke", "#ddd")
                    .style("stroke-opacity", 1);
                return update;
            }
        );

        if (this.renderOptions.isInteractive) {
            this.gridGroup
                .append("g")
                .attr("class", "grid y-grid-right")
                .call(
                    (d3
                        .axisRight(y) as any)
                        .tickValues(this.axisParams.ticks)
                        .tickSize(-this.margin.right)
                        .tickFormat(null)
                )
                .call((g) => g.select(".domain").remove())
                .selectAll("line")
                .attr("class", "y-gridline-right")
                .style("stroke", "#efefef")
                .attr("transform", `translate(${width}, 0)`);

        }
        this.gridGroup
            .selectAll(".y-grid-right")
            .selectAll("text")
            .remove();

        this.gridGroup
            .selectAll(".y-grid")
            .selectAll("text")
            .attr("dx", this.containerSizeCategory == "small" ? "2px" : "6px")
            .attr("dy", this.containerSizeCategory == "small" ? "-2px" : "-6px")

        d3.selectAll(".grid text").style("font-size", gridLabelSizes[this.containerSizeCategory]).attr("fill", "#666");
    }

    private drawAnnotations() {
        const { x, height } = this.context;

        this.annotationGroup.selectAll("*").remove();

        this.annotations.forEach(annotation => {
            const lineX = x(annotation.date);

            this.annotationGroup
                .append("line")
                .attr("class", "vertical-line")
                .attr("x1", lineX)
                .attr("x2", lineX)
                .attr("y1", this.margin.top)
                .attr("y2", height - this.margin.bottom)
                .attr("stroke", '#999')
                .attr("opacity", 1)
                .attr("stroke-width", 0.75);

            this.annotationGroup
                .append("text")
                .attr("class", "vertical-line-label")
                .attr("id", annotation.id + "-label")
                .attr("x", lineX)
                .attr("y", this.margin.top - 4)
                .attr("transform", `rotate(-90, ${lineX}, ${this.margin.top})`)
                .attr("text-anchor", "end")
                .attr("fill", "#aaa")
                .attr("stroke", "#f9f9f9")
                .attr("stroke-width", 4)
                .attr("paint-order", "stroke")
                .attr("font-size", `${verticalLineLabelSizes[this.containerSizeCategory]}px`)
                .style("font-weight", "400")
                .text(annotation.text)
        });
    }

    private drawGenericSeries() {
        // dots
        const { x, y } = this.context;
        const flatPoints: any[] = [];
        for (const [seriesId, pts] of Object.entries(this.seriesPoints)) {
            for (const p of pts) flatPoints.push({ seriesId, p });
        }
        const dotSel = this.dataGroup.selectAll('.series-dot').data(
            flatPoints.filter((d: any) => d.p.value !== undefined && d.p.value !== null && d.p.value > 0.01) as any,
            (d: any) => (d.p.date.getTime() + '|' + d.seriesId)
        );
        dotSel
            .join(
                enter => enter.append('circle')
                    .attr('class', (d: any) => `series-dot series-${d.seriesId}`)
                    .attr('clip-path', 'unset')
                    .attr('cx', (d: any) => x(d.p.date))
                    .attr('cy', (d: any) => y(d.p.value))
                    .attr('r', dotSizes[this.axisParams.xTickLevel][this.containerSizeCategory])
                    .attr('opacity', 0)
                    .attr('fill', (d: any) => this.findSeriesColor(d.seriesId))
                    .call(enter => enter.transition().duration(500).attr('opacity', 0.18)),
                update => update
                    .transition().duration(500)
                    .attr('opacity', 0.16)
                    .attr('r', dotSizes[this.axisParams.xTickLevel][this.containerSizeCategory])
                    .attr('cx', (d: any) => x(d.p.date))
                    .attr('cy', (d: any) => y(d.p.value)),
                exit => exit.transition().duration(500).attr('opacity', 0).remove()
            );

        // lines
        for (const s of this.seriesDescriptors) {
            const line = d3.line<SeriesDaily>()
                .x(d => x(d.date))
                .y(d => y(d.value as number))
                .curve(d3.curveMonotoneX);
            const lineData = (this.seriesDaily[s.id] || []).filter(d => d.value !== undefined);

            this.dataGroup
                .selectAll(`.series-${s.id}-line`)
                .data([lineData])
                .join(
                    enter => enter.append('path')
                        .attr('class', `series-${s.id}-line`)
                        .attr('clip-path', 'unset')
                        .attr('fill', 'none')
                        .attr('stroke', s.color)
                        .attr('stroke-width', lineWidths[this.containerSizeCategory] * 6)
                        .attr('stroke-linecap', 'round')
                        .attr('opacity', 0.07)
                        .attr('d', line),
                    update => update
                        .attr('clip-path', 'unset')
                        .transition().duration(500)
                        .attr('d', line),
                    exit => exit.remove()
                );

            this.dataGroup
                .selectAll(`.series-${s.id}-foreground-line`)
                .data([lineData])
                .join(
                    enter => enter.append('path')
                        .attr('class', `series-${s.id}-foreground-line foreground`)
                        .attr('clip-path', `url(#${this.clipPathId})`)
                        .attr('fill', 'none')
                        .attr('stroke', s.color)
                        .attr('stroke-width', lineWidths[this.containerSizeCategory])
                        .attr('opacity', 1)
                        .attr('d', line),
                    update => update
                        .attr('clip-path', `url(#${this.clipPathId})`)
                        .transition().duration(500).attr('d', line),
                    exit => exit.remove()
                );
        }
    }

    private findSeriesColor(seriesId: string): string {
        const s = this.seriesDescriptors.find(sd => sd.id === seriesId);
        return s?.color ?? '#777';
    }

    private setupInteractivityForSeries(dates?: Date[]) {
        const { x, y, width, height } = this.context;

        this.hoverLine
            .attr("stroke", "#000")
            .attr("stroke-width", 0.75)
            .attr("y1", this.margin.top)
            .attr("y2", height - this.margin.bottom)
            .attr("opacity", 0);

        this.mouseEventRect
            .attr("width", width)
            .attr("height", height)
            .style("fill", "none")
            .style("pointer-events", "all")
            .style("touch-action", "none")
            .on("pointerdown", (event) => {
                event.target.setPointerCapture(event.pointerId);
                this.handleMouseMoveSeries(event, dates ?? this.alignedDates);
            })
            .on("pointermove", (event) => {
                this.handleMouseMoveSeries(event, dates ?? this.alignedDates);
            })
            .on("pointerup pointercancel", (event) => {
                event.target.releasePointerCapture(event.pointerId);
                this.updateSeriesTooltipsToLast(dates ?? this.alignedDates);
            })
            .on("mouseleave", () => {
                this.updateSeriesTooltipsToLast(dates ?? this.alignedDates);
            });

        this.mouseEventRect.node()?.addEventListener("touchmove", (event) => event.preventDefault());

        // ensure clipPath exists and is initialized to "now"
        let clipPathSelection = this.svgDefs.selectAll(`#${this.clipPathId}`).data([null]);
        clipPathSelection.join(
            enter => {
                const clipPath = enter.append("clipPath")
                    .attr("id", this.clipPathId)
                    .append("rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", x(new Date()))
                    .attr("height", height);
                return clipPath;
            },
            update => {
                update.select("rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", x(new Date()))
                    .attr("height", height);
                return update;
            }
        );

        this.updateSeriesTooltipsToLast(dates ?? this.alignedDates);
    }

    private handleMouseMoveSeries(event: MouseEvent | TouchEvent, dates?: Date[]) {
        const { x } = this.context;
        const [mouseX] = d3.pointer(event, event.currentTarget as any);
        const hoveredDate = x.invert(mouseX);
        if (!dates || dates.length === 0) return;
        const nearestDate = dates.reduce((prev, curr) => Math.abs(curr.getTime() - hoveredDate.getTime()) < Math.abs(prev.getTime() - hoveredDate.getTime()) ? curr : prev);
        this.updateSeriesTooltips(nearestDate);
    }

    private updateSeriesTooltipsToLast(dates?: Date[]) {
        if (!dates || dates.length === 0) return;
        this.updateSeriesTooltips(dates[dates.length - 1]);
    }

    private updateSeriesTooltips(date: Date) {
        const { x, y, height } = this.context;
        this.tooltipGroup.selectAll("*").remove();

        this.hoverLine
            .attr("x1", x(date))
            .attr("x2", x(date))
            .attr("opacity", 1);

        const dateLabel = this.tooltipGroup.append("text")
            .attr("x", x(date))
            .attr("y", -6 + this.margin.top)
            .attr("text-anchor", "middle")
            .attr("fill", "#222")
            .attr("font-size", `${gridLabelSizes[this.containerSizeCategory]}px`)
            .style("font-weight", "400")
            .text(
                date.toLocaleDateString("hu-HU", {
                    year: new Date().getFullYear() === date.getFullYear() ? undefined : "numeric",
                    month: new Date().getFullYear() === date.getFullYear() ? "long" : "short",
                    day: "numeric",
                }),
            );

        const positions: { seriesId: string; x: number; y: number; value: number; color: string; label: string }[] = [];
        for (const s of this.seriesDescriptors) {
            const seriesArr = this.seriesDaily[s.id] || [];
            const point = seriesArr.find(d => +d.date === +date);
            if (!point || point.value === undefined) continue;
            positions.push({ seriesId: s.id, x: x(date), y: y(point.value), value: point.value, color: s.color, label: s.label });
        }
        // robust, bounded collision resolution
        const minDistance = partyLabelSizes[this.containerSizeCategory] + 1;
        const sorted = positions.slice().sort((a, b) => a.y - b.y);
        const targetYs = sorted.map(p => p.y);
        const resolvedYs = this.resolveVerticalOverlaps(targetYs, minDistance);
        const adjusted: { x: number; y: number; oldY: number; text: string; color: string }[] = sorted.map((p, i) => ({
            x: p.x,
            y: resolvedYs[i],
            oldY: p.y,
            text: `${p.label} ${(p.value * 100).toFixed(0)}`,
            color: p.color,
        }));

        adjusted.forEach((t) => {
            this.tooltipGroup.append("circle")
                .attr("cx", t.x + 8)
                .attr("cy", t.y)
                .attr("r", Math.max(dotSizes[this.axisParams.xTickLevel][this.containerSizeCategory] * 1.8, 4))
                .attr("fill", t.color)
                .attr("stroke", "#f9f9f9")
                .attr("stroke-width", 1);

            this.tooltipGroup.append("text")
                .attr("x", t.x + 16)
                .attr("y", t.y + 1)
                .attr("text-anchor", "start")
                .attr("alignment-baseline", "middle")
                .attr("stroke", "#f9f9f9")
                .attr("stroke-width", 2)
                .style("font-size", partyLabelSizes[this.containerSizeCategory])
                .style("font-weight", 400)
                .attr("paint-order", "stroke")
                .attr("fill", t.color)
                .text(t.text);
        });

        adjusted.forEach((t) => {
            if (Math.abs(t.oldY - t.y) > 0) {
                this.tooltipGroup.append("line")
                    .attr("x1", t.x)
                    .attr("x2", t.x + 8)
                    .attr("y1", t.oldY)
                    .attr("y2", t.y)
                    .attr("stroke", t.color)
                    .attr("stroke-width", 1)
                    .attr("linecap", "round")
                    .lower();
            }
        });

        // update clip to current date
        const clipRect = this.svg.select("#" + this.clipPathId + " rect");
        clipRect
            .attr("x", 0)
            .attr("width", Math.max(0, x(date)))
            .attr("height", height);
    }

    private setupInteractivity() {
        const { x, y, width, height } = this.context;

        this.hoverLine
            .attr("stroke", "#000")
            .attr("stroke-width", 0.75)
            .attr("y1", this.margin.top)
            .attr("y2", height - this.margin.bottom)
            .attr("opacity", 0);

        this.mouseEventRect
            .attr("width", width)
            .attr("height", height)
            .style("fill", "none")
            .style("pointer-events", "all")
            .style("touch-action", "none")
            .on("pointerdown", (event) => {
                event.target.setPointerCapture(event.pointerId);
                this.handleMouseMove(event);
            })
            .on("pointermove", (event) => {
                this.handleMouseMove(event);
            })
            .on("pointerup pointercancel", (event) => {
                event.target.releasePointerCapture(event.pointerId);
                this.updateTooltips(this.dailyData[this.dailyData.length - 1]);
            })
            .on("mouseleave", () => {
                this.updateTooltips(this.dailyData[this.dailyData.length - 1]);
            });

        this.mouseEventRect.node()?.addEventListener("touchmove", (event) => event.preventDefault());

        let clipPathSelection = this.svgDefs.selectAll(`#${this.clipPathId}`).data([null]);
        clipPathSelection.join(
            enter => {
                const clipPath = enter.append("clipPath")
                    .attr("id", this.clipPathId)
                    .append("rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", x(new Date()))
                    .attr("height", height);
                return clipPath;
            },
            update => {
                update.select("rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", x(new Date()))
                    .attr("height", height);
                return update;
            }
        );

        if (this.dailyData && this.dailyData.length > 0) {
            this.updateTooltips(this.dailyData[this.dailyData.length - 1]);
        }
    }

    private handleMouseMove(event: MouseEvent | TouchEvent) {
        const { x } = this.context;

        const [mouseX] = d3.pointer(event, event.currentTarget);
        const hoveredDate = x.invert(mouseX);

        // Find the closest data point for each party
        const closestData = this.dailyData.map((day) => ({
            date: day.date,
            ...this.selectedParties.reduce((acc, party) => {
                if (day[party] !== undefined && day[party] !== null) {
                    acc[party] = day[party];
                }
                return acc;
            }, {} as Record<Party, number>),
        }));

        const nearestData = closestData.reduce((prev, curr) => {
            const prevDiff = Math.abs(prev.date.getTime() - hoveredDate.getTime());
            const currDiff = Math.abs(curr.date.getTime() - hoveredDate.getTime());
            return currDiff < prevDiff ? curr : prev;
        });

        this.updateTooltips(nearestData ?? this.dailyData[this.dailyData.length - 1]);
    }

    private updateTooltips(data: DayData) {
        const { x, height } = this.context;
        this.tooltipGroup.selectAll("*").remove();

        this.hoverLine
            .attr("x1", x(data.date))
            .attr("x2", x(data.date))
            .attr("opacity", 1);

        const dateInCurrentYear = new Date().getFullYear() === data.date.getFullYear();

        const dateLabel = this.tooltipGroup.append("text")
            .attr("x", x(data.date))
            .attr("y", -6 + this.margin.top)
            .attr("text-anchor", "middle")
            .attr("fill", "#222")
            .attr("font-size", `${gridLabelSizes[this.containerSizeCategory]}px`)
            .style("font-weight", "400")
            .text(
                new Date(data.date).toLocaleDateString("hu-HU", {
                    year: dateInCurrentYear ? undefined : "numeric",
                    month: dateInCurrentYear ? "long" : "short",
                    day: "numeric",
                }),
            );

        this.handleTooltipOverlaps(data)

        const clipRect = this.svg.select("#" + this.clipPathId + " rect");
        clipRect
            .attr("x", 0)
            .attr("width", Math.max(0, x(data.date)))
            .attr("height", height);
    }

    private handleTooltipOverlaps(data: DayData) {
        const { x, y } = this.context;

        const tooltipPositions: { party: Party; x: number; y: number; value: number }[] = [];

        this.selectedParties.forEach((party) => {
            if (data[party] !== undefined) {
                tooltipPositions.push({
                    party,
                    x: x(data.date),
                    y: y(data[party] as number),
                    value: data[party] as number,
                });
            }
        });

        // robust, bounded collision resolution for legacy party tooltips
        const minDistance = partyLabelSizes[this.containerSizeCategory] + 1;
        const sorted = tooltipPositions.slice().sort((a, b) => a.y - b.y);
        const targetYs = sorted.map(p => p.y);
        const resolvedYs = this.resolveVerticalOverlaps(targetYs, minDistance);
        const adjustedPositions: { x: number; y: number; oldY: number; text: string, color: string }[] = sorted.map((tooltip, i) => ({
            x: tooltip.x,
            y: resolvedYs[i],
            oldY: tooltip.y,
            text: `${partyData[tooltip.party].name} ${(tooltip.value * 100).toFixed(0)}`,
            color: partyData[tooltip.party].color,
        }));

        // Render adjusted tooltips
        adjustedPositions.forEach((tooltip) => {
            this.tooltipGroup.append("circle")
                .attr("cx", tooltip.x + 8)
                .attr("cy", tooltip.y)
                .attr("r", Math.max(dotSizes[this.axisParams.xTickLevel][this.containerSizeCategory] * 1.8, 4))
                .attr("fill", tooltip.color)
                .attr("stroke", "#f9f9f9")
                .attr("stroke-width", 1);

            this.tooltipGroup.append("text")
                .attr("x", tooltip.x + 16)
                .attr("y", tooltip.y + 1)
                .attr("text-anchor", "start")
                .attr("alignment-baseline", "middle")
                .attr("stroke", "#f9f9f9")
                .attr("stroke-width", 2)
                .style("font-size", partyLabelSizes[this.containerSizeCategory])
                .style("font-weight", 400)
                .attr("paint-order", "stroke")
                .attr("fill", tooltip.color)
                .text(tooltip.text);
        });

        // connect adjusted positions with lines
        adjustedPositions.forEach((tooltip) => {
            if (Math.abs(tooltip.oldY - tooltip.y) > 0) {
                this.tooltipGroup.append("line")
                    .attr("x1", tooltip.x)
                    .attr("x2", tooltip.x + 8)
                    .attr("y1", tooltip.oldY)
                    .attr("y2", tooltip.y)
                    .attr("stroke", tooltip.color)
                    .attr("stroke-width", 1)
                    .attr("linecap", "round")
                    .lower();
            }
        });
    }

    // Ensure labels are within bounds and separated by at least minDistance.
    // Uses two-pass constraint solving with dynamic spacing when space is insufficient.
    private resolveVerticalOverlaps(targetYs: number[], minDistance: number): number[] {
        if (targetYs.length === 0) return [];

        const topBound = this.margin.top;
        const bottomBound = this.context.height - this.margin.bottom;
        const count = targetYs.length;

        // If there isn't enough vertical space for the requested spacing, relax spacing uniformly
        const available = Math.max(0, bottomBound - topBound);
        let spacing = minDistance;
        if (count > 1 && (count - 1) * spacing > available) {
            spacing = available / (count - 1);
        }

        // Work on a copy and sort ascending by Y while tracking original order via indices
        const indices = targetYs.map((_, i) => i).sort((a, b) => targetYs[a] - targetYs[b]);
        const ys = indices.map(i => Math.min(Math.max(targetYs[i], topBound), bottomBound));

        // Forward pass: enforce minimum spacing from top to bottom and progressive lower bounds
        ys[0] = Math.max(ys[0], topBound);
        for (let i = 1; i < ys.length; i++) {
            const minAllowed = topBound + i * spacing;
            ys[i] = Math.max(ys[i], ys[i - 1] + spacing, minAllowed);
        }

        // Backward pass: enforce minimum spacing from bottom to top and progressive upper bounds
        ys[ys.length - 1] = Math.min(ys[ys.length - 1], bottomBound);
        for (let i = ys.length - 2; i >= 0; i--) {
            const maxAllowed = bottomBound - (ys.length - 1 - i) * spacing;
            ys[i] = Math.min(ys[i], ys[i + 1] - spacing, maxAllowed);
        }

        // Map back to original order
        const resolved: number[] = new Array(count);
        for (let i = 0; i < indices.length; i++) {
            resolved[indices[i]] = ys[i];
        }
        return resolved;
    }
}