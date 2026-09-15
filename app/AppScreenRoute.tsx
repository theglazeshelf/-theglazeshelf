import GlazeShelfApp from "./GlazeShelfApp";
import type { AppScreen } from "@/lib/app-routes";

export default function AppScreenRoute({ screen }: { screen: AppScreen }) {
  return <GlazeShelfApp initialScreen={screen} />;
}
