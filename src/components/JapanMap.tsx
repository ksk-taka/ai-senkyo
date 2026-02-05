"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { prefectures } from "@/lib/data/districts";
import { getPartyColor, getConfidenceOpacity } from "@/lib/utils/colors";

interface PrefecturePrediction {
  prefectureId: number;
  leadingParty: string;
  confidence: "high" | "medium" | "low";
  commentary?: string;
}

interface JapanMapProps {
  predictions?: PrefecturePrediction[];
  onPrefectureClick?: (prefectureId: number, prefectureName: string) => void;
  width?: number;
  height?: number;
}

export default function JapanMap({
  predictions = [],
  onPrefectureClick,
  width = 800,
  height = 600,
}: JapanMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    x: number;
    y: number;
    content: string;
  }>({ show: false, x: 0, y: 0, content: "" });

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Load TopoJSON
    d3.json("/api/japan-map").then((topoData: any) => {
      if (!topoData) return;

      const geojson = topojson.feature(
        topoData,
        topoData.objects.japan
      ) as any;

      // Create projection
      const projection = d3
        .geoMercator()
        .center([137, 38])
        .scale(1500)
        .translate([width / 2, height / 2]);

      const path = d3.geoPath().projection(projection);

      // Draw prefectures
      svg
        .selectAll("path")
        .data(geojson.features)
        .enter()
        .append("path")
        .attr("d", path as any)
        .attr("fill", (d: any) => {
          const prefId = d.properties.id;
          const prediction = predictions.find((p) => p.prefectureId === prefId);
          if (prediction) {
            const opacity = getConfidenceOpacity(prediction.confidence);
            return getPartyColor(prediction.leadingParty, opacity);
          }
          return "#e5e7eb";
        })
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5)
        .style("cursor", "pointer")
        .on("mouseover", function (event: MouseEvent, d: any) {
          d3.select(this).attr("stroke-width", 2).attr("stroke", "#333");

          const prefId = d.properties.id;
          const prefData = prefectures.find((p) => p.id === prefId);
          const prediction = predictions.find((p) => p.prefectureId === prefId);

          let content = d.properties.nam_ja || prefData?.name || "不明";
          if (prediction) {
            if (prediction.leadingParty) {
              content += `\n優勢: ${prediction.leadingParty}`;
              content += `\n確信度: ${
                prediction.confidence === "high"
                  ? "高"
                  : prediction.confidence === "medium"
                  ? "中"
                  : "低"
              }`;
              if (prediction.commentary) {
                // コメントが長い場合は切り詰め
                const shortComment = prediction.commentary.length > 80
                  ? prediction.commentary.substring(0, 77) + "..."
                  : prediction.commentary;
                content += `\n\n📝 ${shortComment}`;
              }
            } else {
              content += `\n（更新待ち）`;
            }
          }

          setTooltip({
            show: true,
            x: event.pageX,
            y: event.pageY,
            content,
          });
        })
        .on("mouseout", function () {
          d3.select(this).attr("stroke-width", 0.5).attr("stroke", "#fff");
          setTooltip({ show: false, x: 0, y: 0, content: "" });
        })
        .on("click", (event: MouseEvent, d: any) => {
          const prefId = d.properties.id;
          const prefData = prefectures.find((p) => p.id === prefId);
          if (onPrefectureClick && prefData) {
            onPrefectureClick(prefId, prefData.name);
          }
        });
    });
  }, [predictions, onPrefectureClick, width, height]);

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="bg-blue-50 rounded-lg"
      />
      {tooltip.show && (
        <div
          className="absolute bg-gray-900 text-white px-3 py-2 rounded shadow-lg text-sm whitespace-pre-line pointer-events-none z-10"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y + 10,
            transform: "translate(-50%, -100%)",
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}
