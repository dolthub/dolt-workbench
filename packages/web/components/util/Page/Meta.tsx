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
  return (
    <Head>
      <title>{title}</title>
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
    </Head>
  );
}
