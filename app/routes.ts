import { router } from "@app:router";
import HomeController from "@app/controllers/home";

router.get("/", [HomeController, "index"]).name("home");
router.get("/foo", () => "foo").name("foo");
router.get("/bar", async () => "bar").name("bar");
