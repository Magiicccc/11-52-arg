import { useEffect, useRef } from "react";
import maplibregl, { type GeoJSONSource, type Map as MapLibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { temporaryMapPois, type TemporaryMapPoi } from "@/content/realism-life-data";

type FeatureCollection = GeoJSON.FeatureCollection<GeoJSON.Geometry, GeoJSON.GeoJsonProperties>;

const extent = 0.012;
const toCoordinate = (x: number, y: number): [number, number] => [
  ((x - 50) / 50) * extent,
  ((50 - y) / 50) * extent
];

const roadLines: Array<{ name: string; width: "primary" | "secondary"; coordinates: [number, number][] }> = [
  { name: "滨河路", width: "primary", coordinates: [[-0.013, 0.008], [-0.008, 0.005], [-0.003, 0.004], [0.003, 0.002], [0.012, -0.001]] },
  { name: "生活路", width: "primary", coordinates: [[-0.009, -0.012], [-0.007, -0.006], [-0.004, 0], [-0.003, 0.012]] },
  { name: "学苑街", width: "primary", coordinates: [[0.006, -0.012], [0.004, -0.006], [0.003, 0], [0.004, 0.012]] },
  { name: "社区路", width: "secondary", coordinates: [[-0.012, -0.005], [-0.004, -0.004], [0.004, -0.005], [0.012, -0.004]] },
  { name: "公园支路", width: "secondary", coordinates: [[-0.011, 0.009], [-0.002, 0.008], [0.007, 0.009], [0.012, 0.006]] },
  { name: "北侧巷", width: "secondary", coordinates: [[-0.012, 0.002], [-0.004, 0.001], [0.004, 0.002], [0.011, 0.004]] },
  { name: "市场巷", width: "secondary", coordinates: [[-0.01, -0.009], [-0.002, -0.008], [0.007, -0.009], [0.012, -0.007]] },
  { name: "连接路", width: "secondary", coordinates: [[-0.001, -0.012], [0, -0.005], [0, 0.003], [0.002, 0.012]] }
];

const roadData: FeatureCollection = {
  type: "FeatureCollection",
  features: roadLines.map((road) => ({
    type: "Feature",
    properties: { name: road.name, width: road.width },
    geometry: { type: "LineString", coordinates: road.coordinates }
  }))
};

const blocks: FeatureCollection = {
  type: "FeatureCollection",
  features: ([
    [-0.010, 0.004, -0.006, 0.008], [-0.0055, 0.004, -0.001, 0.008], [0.0005, 0.004, 0.003, 0.008],
    [0.0045, 0.004, 0.009, 0.008], [-0.010, -0.0035, -0.006, 0.0005], [-0.0055, -0.0035, -0.001, 0.0005],
    [0.0005, -0.0035, 0.003, 0.0005], [0.0045, -0.0035, 0.009, 0.0005], [-0.010, -0.009, -0.006, -0.005],
    [-0.0055, -0.009, -0.001, -0.005], [0.0005, -0.009, 0.003, -0.005], [0.0045, -0.009, 0.009, -0.005]
  ] as Array<[number, number, number, number]>).map(([west, south, east, north], index) => ({
    type: "Feature",
    properties: { id: `temporary-building-${index + 1}` },
    geometry: {
      type: "Polygon",
      coordinates: [[[west, south], [east, south], [east, north], [west, north], [west, south]]]
    }
  }))
};

const greenAndWater: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { kind: "park" },
      geometry: { type: "Polygon", coordinates: [[[0.007, 0.001], [0.013, 0.001], [0.013, 0.011], [0.008, 0.009], [0.007, 0.001]]] }
    },
    {
      type: "Feature",
      properties: { kind: "water" },
      geometry: { type: "Polygon", coordinates: [[[-0.014, 0.012], [-0.011, 0.011], [-0.005, 0.013], [0.002, 0.012], [0.014, 0.014], [0.014, 0.017], [-0.014, 0.017], [-0.014, 0.012]]] }
    }
  ]
};

const poiData: FeatureCollection = {
  type: "FeatureCollection",
  features: temporaryMapPois.map((poi) => ({
    type: "Feature",
    properties: { id: poi.id, name: poi.name, category: poi.category, detail: poi.detail },
    geometry: { type: "Point", coordinates: toCoordinate(poi.x, poi.y) }
  }))
};

const routeData: FeatureCollection = {
  type: "FeatureCollection",
  features: [{
    type: "Feature",
    properties: { kind: "temporary-route" },
    geometry: {
      type: "LineString",
      coordinates: [
        toCoordinate(18, 22),
        [-0.004, 0.004],
        [-0.003, 0],
        [0, -0.001],
        toCoordinate(48, 48),
        [0.005, -0.004],
        toCoordinate(79, 72)
      ]
    }
  }]
};

const style: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    areas: { type: "geojson", data: greenAndWater },
    buildings: { type: "geojson", data: blocks },
    roads: { type: "geojson", data: roadData },
    pois: { type: "geojson", data: poiData },
    route: { type: "geojson", data: routeData }
  },
  layers: [
    { id: "background", type: "background", paint: { "background-color": "#eef1e8" } },
    { id: "park", type: "fill", source: "areas", filter: ["==", ["get", "kind"], "park"], paint: { "fill-color": "#cfe5c4", "fill-opacity": 0.9 } },
    { id: "water", type: "fill", source: "areas", filter: ["==", ["get", "kind"], "water"], paint: { "fill-color": "#b7dbea", "fill-opacity": 0.95 } },
    { id: "buildings", type: "fill", source: "buildings", paint: { "fill-color": "#d7d1c8", "fill-outline-color": "#c4bdb3" } },
    { id: "roads-casing", type: "line", source: "roads", paint: { "line-color": "#ddd8ce", "line-width": ["case", ["==", ["get", "width"], "primary"], 12, 7] } },
    { id: "roads", type: "line", source: "roads", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#ffffff", "line-width": ["case", ["==", ["get", "width"], "primary"], 9, 5] } },
    { id: "route", type: "line", source: "route", layout: { visibility: "none", "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#2f7cf6", "line-width": 5, "line-opacity": 0.88 } },
    { id: "pois", type: "circle", source: "pois", paint: { "circle-color": "#2879f2", "circle-radius": 5, "circle-stroke-color": "#fff", "circle-stroke-width": 2 } }
  ]
};

export function DeidentifiedMap({
  selectedPoiId,
  routeVisible,
  locateRequest,
  onSelectPoi,
  onViewportChanged,
  onReady,
  onError
}: {
  selectedPoiId: string | null;
  routeVisible: boolean;
  locateRequest: number;
  onSelectPoi(poi: TemporaryMapPoi): void;
  onViewportChanged(viewport: { center: [number, number]; zoom: number }): void;
  onReady(): void;
  onError(message: string): void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const callbacksRef = useRef({ onSelectPoi, onViewportChanged, onReady, onError });
  callbacksRef.current = { onSelectPoi, onViewportChanged, onReady, onError };

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    try {
      const map = new maplibregl.Map({
        container: containerRef.current,
        style,
        center: [0, 0],
        zoom: 15.2,
        minZoom: 14.4,
        maxZoom: 18,
        attributionControl: false,
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false
      });
      mapRef.current = map;
      map.addControl(new maplibregl.NavigationControl({ showCompass: false, visualizePitch: false }), "bottom-right");
      map.on("load", () => {
        const canvas = map.getCanvas();
        canvas.dataset.interactionId = "app.baidu_map:map-gesture";
        canvas.dataset.interactionState = "works";
        canvas.dataset.interactionKind = "gesture";
        canvas.setAttribute("aria-label", "拖动或缩放地图");
        const poiMarkers = temporaryMapPois.map((poi) => {
          const element = document.createElement("button");
          element.className = "map-poi-marker";
          element.type = "button";
          element.dataset.interactionId = `app.baidu_map:poi:${poi.id}`;
          element.dataset.interactionState = "works";
          element.innerHTML = `<span>${poi.category.slice(0, 1)}</span><b>${poi.name}</b>`;
          element.addEventListener("click", () => callbacksRef.current.onSelectPoi(poi));
          return new maplibregl.Marker({ element, anchor: "bottom" })
            .setLngLat(toCoordinate(poi.x, poi.y))
            .addTo(map);
        });
        const roadMarkers = roadLines.map((road) => {
          const element = document.createElement("span");
          element.className = `map-road-name ${road.width}`;
          element.textContent = road.name;
          element.setAttribute("aria-hidden", "true");
          const midpoint = road.coordinates[Math.floor(road.coordinates.length / 2)]!;
          const marker = new maplibregl.Marker({ element, anchor: "center" })
            .setLngLat(midpoint)
            .addTo(map);
          element.tabIndex = -1;
          element.removeAttribute("role");
          element.removeAttribute("aria-label");
          return marker;
        });
        const currentLocation = document.createElement("span");
        currentLocation.className = "map-current-location";
        currentLocation.setAttribute("aria-label", "当前模拟位置");
        currentLocation.innerHTML = "<i></i>";
        const currentMarker = new maplibregl.Marker({ element: currentLocation, anchor: "center" })
          .setLngLat([0, 0])
          .addTo(map);
        currentLocation.tabIndex = -1;
        currentLocation.removeAttribute("role");
        currentLocation.removeAttribute("aria-label");
        currentLocation.setAttribute("aria-hidden", "true");
        markersRef.current = [...poiMarkers, ...roadMarkers, currentMarker];
        callbacksRef.current.onReady();
      });
      map.on("moveend", () => {
        const center = map.getCenter();
        callbacksRef.current.onViewportChanged({
          center: [Number(center.lng.toFixed(6)), Number(center.lat.toFixed(6))],
          zoom: Number(map.getZoom().toFixed(2))
        });
      });
      map.on("error", (event) => callbacksRef.current.onError(event.error?.message ?? "MapLibre render error"));
    } catch (error) {
      callbacksRef.current.onError(error instanceof Error ? error.message : "MapLibre initialization failed");
    }
    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (locateRequest <= 0) return;
    mapRef.current?.easeTo({ center: [0, 0], zoom: 16.2, duration: 420 });
  }, [locateRequest]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;
    map.setLayoutProperty("route", "visibility", routeVisible ? "visible" : "none");
    const source = map.getSource("route") as GeoJSONSource | undefined;
    source?.setData(routeData);
  }, [routeVisible]);

  useEffect(() => {
    if (!selectedPoiId) return;
    const poi = temporaryMapPois.find((candidate) => candidate.id === selectedPoiId);
    if (poi) mapRef.current?.easeTo({ center: toCoordinate(poi.x, poi.y), zoom: 16.4, duration: 450 });
  }, [selectedPoiId]);

  return <div className="maplibre-canvas" ref={containerRef} data-testid="maplibre-map" aria-label="可平移缩放的离线矢量地图"/>;
}
