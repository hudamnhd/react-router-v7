import {
	index,
	route,
	layout,
	type RouteConfig,
} from "@react-router/dev/routes";

export default [
	layout("layout/contacts.tsx", [
		index("routes/home.tsx"),
		route("contacts", "routes/contacts.tsx", [
			route(":contactId", "routes/contacts/details.tsx"),
			route(":contactId/destroy", "routes/contacts/destroy.tsx"),
			route(":contactId/edit", "routes/contacts/edit.tsx"),
		]),
	]),
] satisfies RouteConfig;
