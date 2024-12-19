import {
  index,
  route,
  layout,
  type RouteConfig,
} from "@react-router/dev/routes";

export default [
  layout("layout/muslim.tsx", [
    route("muslim", "routes/muslim.tsx", [
      index("routes/muslim/index.tsx"),
      route("quran-surat/:id", "routes/muslim/quran-surat.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
