import { Link } from "@remix-run/react";
import { type MetaFunction } from "@remix-run/node";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "#app/components/ui/card";
import { AutosizeTextarea } from "#app/components/ui/autosize-textarea.tsx";
export const meta: MetaFunction = () => [{ title: "About | Doti App" }];

export default function Index() {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Application Information</CardTitle>
        <CardDescription>Information details</CardDescription>
      </CardHeader>
      <CardContent>
        <AutosizeTextarea dir="rtl" className="font-lpmq" />
      </CardContent>
    </Card>
  );
}
