 import { DatabaseParams } from "@lib/params";
import DesktopAppNavbar from "./DesktopAppNavbar";
 
type Props = {
  params?: DatabaseParams;
};

export default function Nav({ params }: Props) {
  return <DesktopAppNavbar params={params} />
 
}
 