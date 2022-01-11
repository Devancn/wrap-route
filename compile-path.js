import { warning } from "./utils";

export default function compilePath(
  path,
  caseSensitive = false,
  end = true
) {
  warning(
    path === "*" || !path.endsWith("*") || path.endsWith("/*"),
    `Route path "${path}" will be treated as if it were ` +
    `"${path.replace(/\*$/, "/*")}" because the \`*\` character must ` +
    `always follow a \`/\` in the pattern. To get rid of this warning, ` +
    `please change the route path to "${path.replace(/\*$/, "/*")}".`
  );

  let paramNames = [];
  let regexpSource =
    "^" +
    path
      .replace(/\/*\*?$/, "") // Ignore trailing / and /*, we'll handle it below
      .replace(/^\/*/, "/") // Make sure it has a leading /
      .replace(/[\\.*+^$?{}|()[\]]/g, "\\$&") // Escape special regex chars
      .replace(/:(\w+)/g, (_, paramName) => {
        paramNames.push(paramName);
        return "([^\\/]+)";
      });

  if (path.endsWith("*")) {
    paramNames.push("*");
    regexpSource +=
      path === "*" || path === "/*"
        ? "(.*)$" // Already matched the initial /, just match the rest
        : "(?:\\/(.+)|\\/*)$"; // Don't include the / in params["*"]
  } else {
    regexpSource += end
      ? "\\/*$" // When matching to the end, ignore trailing slashes
      : // Otherwise, match a word boundary or a proceeding /. The word boundary restricts
      // parent routes to matching only their own words and nothing more, e.g. parent
      // route "/home" should not match "/home2".
      "(?:\\b|\\/|$)";
  }

  let matcher = new RegExp(regexpSource, caseSensitive ? undefined : "i");

  return [matcher, paramNames];
}