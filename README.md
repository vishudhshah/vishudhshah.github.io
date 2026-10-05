# Personal Website

This repository contains the source code for my personal portfolio website, built using the [vCard template by Sadee](https://github.com/codewithsadee/vcard-personal-portfolio).

## Features

- Responsive design
- Smooth scrolling
- Easy customization
- Contact form integration with Google Forms
- Cross-device compatibility

## Usage

Feel free to customize the content and styles for your own personal website.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
## Automatic sitemap and deployment

`.github/workflows/pages.yml` generates the sitemap on every push to `main`,
once daily, or when run manually from Actions. It follows links and embedded
frames from the homepage, using local HTML first and fetching same-domain
project pages when they belong to other repositories. New pages must be linked
from a reachable page. Fragment links, external sites, query URLs, non-HTML
assets, robots.txt exclusions, and pages marked noindex are excluded.

The generator uses Python's standard library and curl. Run it locally with:

```sh
python3 scripts/generate_sitemap.py --output /tmp/sitemap.xml
```

A failed fetch or crawl limit stops deployment rather than publishing a partial
sitemap. The generated sitemap is included in the deployment artifact; the
workflow never commits it back to the repository. It omits lastmod rather than
inventing modification dates for pages hosted in other repositories.

To activate after committing the workflow, set **Settings → Pages → Build and
deployment → Source** to **GitHub Actions**, then run the workflow. Until that
setting is changed, the existing branch-based publishing remains in use.
