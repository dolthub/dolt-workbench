import { colors } from "@lib/tailwind";
import Head from "next/head";

type Props = {
  title?: string;
  description?: string;
  noIndex?: boolean;
};

// Defines metadata about the Page, including what information shows in
// the card when the site is linked
export default function Meta(props: Props) {
  const title = props.title
    ? `${props.title} | Dolt SQL Workbench`
    : `Dolt SQL Workbench`;
  const image = "/images/dolt-workbench.png";
  const blue = colors.storm["500"];
  return (
    <Head>
      <title>{title}</title>
      {/* this disables the auto zoom/page shift on mobile when clicking on selectors */}
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1"
      />
      <meta name="title" content={title} />
      {props.description && (
        <meta name="description" content={props.description} />
      )}
      {props.noIndex && <meta name="robots" content="noindex" />}
      <meta property="og:type" content="website" />
      {/* <meta property="og:url" content={url} /> */}
      <meta property="og:title" content={title} />
      {props.description && (
        <meta property="og:description" content={props.description} />
      )}
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Dolt SQL Workbench" />

      <meta name="twitter:card" content="summary" />
      <meta name="twitter:site" content="@dolthub" />
      {/* <meta name="twitter:url" content={url} /> */}
      <meta name="twitter:title" content={title} />
      {props.description && (
        <meta name="twitter:description" content={props.description} />
      )}
      <meta name="twitter:image" content={image} />

      {/* <link rel="canonical" href={url} /> */}

      <link
        rel="apple-touch-icon"
        sizes="76x76"
        href="/favicon/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon/favicon-16x16.png"
      />
      <link rel="manifest" href="/favicon/site.webmanifest" />
      <link
        rel="mask-icon"
        href="/favicon/safari-pinned-tab.svg"
        color={blue}
      />
      <link rel="shortcut icon" href="/favicon/favicon.ico" />
      <meta name="msapplication-TileColor" content={blue} />
      <meta name="msapplication-config" content="/favicon/browserconfig.xml" />
      <meta name="theme-color" content={blue} />
    </Head>
  );
}
