# CLAW Website Link Inventory

Prepared for your personal reference on 11 October 2026.

This inventory follows the journey a visitor takes through the current user-facing website: arriving at the home page, learning about CLAW, browsing dogs, deciding how to support them, and finding contact or legal information. Repeated links are grouped by purpose, with their locations identified. Routes registered in the application but not linked from the visible interface are listed separately.

The site uses hash routing. For local development, prepend `http://localhost:5173/` to a destination beginning with `#`. For example, `#/dogs` becomes `http://localhost:5173/#/dogs`. Email links open the visitor’s email application. Asset URLs, API endpoints and library downloads are not visitor navigation links and are outside this inventory.

## 1 Arriving and moving around the website

The shared navigation provides the main way to move around the site. About Us and Contact Us lead to sections of the home page rather than separate pages. These links remain useful when the visitor is on a dog profile or checkout page, because they return to the home page before scrolling to the relevant section.

| Link | Where it appears | Destination and behaviour |
| --- | --- | --- |
| CLAW logo | Header | `#/` — opens the home page. |
| Home | Header and footer Links group | `#/` — opens the home page. |
| About Us | Header and footer Links group | `#/?section=about` — opens the home page and scrolls to About Us. |
| Our Dogs | Header and footer Links group | `#/dogs` — opens the dog listing. |
| Contact Us | Header and footer Links group | `#/?section=footer-container` — opens the home page and scrolls to footer contact information. |
| Sign Up | Header when logged out | `#/signup` — opens registration. |
| Donate | Header and footer Links group | `#/donate` — opens the general contribution form. |

When logged in, Log Out replaces Sign Up. It is an action button, not a hyperlink: it ends the session and returns the visitor to `#/`.

## 2 Learning about CLAW on the home page

The home page gives visitors two early choices: contribute immediately or learn about the organisation first. Further down, the featured dogs and virtual-adoption explanation lead visitors to the dog listing.

| Link | Where it appears | Destination and behaviour |
| --- | --- | --- |
| Donate Now | Home hero actions | `#/donate` — opens the general contribution form. |
| Learn More | Home hero actions | `#/?section=about` — scrolls to About Us. |
| Browse All Pups | In our care section, desktop and mobile | `#/dogs` — opens the dog listing. |
| View Available Pups | Virtual-adoption section, desktop and mobile | `#/dogs` — opens the dog listing. The destination does not apply an available-only filter; already sponsored dogs are also included. |
| View details arrow | Each featured dog card | `#/dogs/details?dog={id}` — opens that dog’s profile. |
| Adopt | Each available featured dog card | `#/donate?mode=adopt&dog={id}` — opens dog-specific virtual-adoption checkout. |

The featured carousel currently requests available dogs only. Its previous and next controls change the carousel selection; they do not navigate to another page. The donation form embedded on the home page submits a contribution request rather than following a link.

## 3 Browsing dogs and opening a profile

The Our Dogs page includes dogs still in CLAW’s care, whether they are available or already sponsored. Permanently adopted dogs are excluded. The same dog-card links are used here and in the home-page carousel.

| Link or state | Where it appears | Destination and behaviour |
| --- | --- | --- |
| View details arrow | Every dog card | `#/dogs/details?dog={id}` — opens the selected dog’s details. |
| Adopt | Available dog card | `#/donate?mode=adopt&dog={id}` — opens monthly virtual-support checkout for that dog. |
| Already sponsored | Sponsored dog card | Disabled button; no destination. The details arrow remains available. |

The current mock dog identifiers are `bella`, `max`, `rocky`, `cooper`, `duke`, `simba`, `daisy`, `mia`, `zoe` and `honey`. Each identifier produces its own details URL; available dogs also have a corresponding checkout URL. Availability is calculated from sponsorship dates and permanent-placement state, so the visible actions can change over time.

## 4 Choosing how to support a dog

The details page separates virtual financial support from permanent adoption. An available dog has a checkout link. An already sponsored dog instead has an email-based availability request. Permanent-adoption enquiries remain possible in either case.

| Link | When it appears | Destination and behaviour |
| --- | --- | --- |
| Support {dog name} | Available dog details | `#/donate?mode=adopt&dog={id}` — opens dog-specific checkout. |
| Notify me when available | Already sponsored dog details | Email to `CLAWsouthafrica@gmail.com`, with subject `Availability notification request: {dog name}` and a prefilled message asking CLAW for an availability update. |
| Email CLAW | Permanent-adoption invitation on dog details | Email to `CLAWsouthafrica@gmail.com`, with subject `Permanent adoption enquiry: {dog name}`. |
| Browse available dogs | Details error or unavailable adoption checkout | `#/dogs` — returns to the listing, which includes already sponsored dogs as well as available dogs. |

The availability button does not create an automated notification subscription or reserve a dog. Its blue note explicitly explains the email-based request, the future automatic-notification feature, and the possibility that the dog may find a permanent home before another virtual sponsorship becomes possible.

The permanent-adoption invitation currently offers email only. There is no telephone hyperlink on the user-facing website.

## 5 Completing a contribution request

General donations and virtual adoption share the donation route. The `mode=adopt` and `dog` parameters determine whether checkout is for a particular dog.

| Destination | Purpose |
| --- | --- |
| `#/donate` | General contribution checkout, with once-off or monthly support. |
| `#/donate?mode=adopt&dog={id}` | Dog-specific monthly support for up to six months. Unavailable dogs cannot proceed with virtual-adoption checkout. |

Donate and Support {dog name} inside checkout are submit buttons, not navigation links. Amount choices, contribution frequency, and payment-method choices also change form state rather than navigating. Selecting Payfast does not currently redirect to Payfast: the form saves a pending contribution for payment follow-up and takes no payment.

## 6 Creating an account and returning to it

Visitors reach registration from the header and can switch between registration and login using the links beneath the forms. On desktop, switching uses the column transition while changing the route.

| Link or action | Where it appears | Destination and behaviour |
| --- | --- | --- |
| Log In | Beneath the Sign Up form | `#/login` — switches to login. |
| Sign Up | Beneath the Log In form | `#/signup` — switches to registration. |
| Successful registration or login | Authentication form submission | Redirects to `#/dogs`. This is a programmatic redirect, not a hyperlink. |
| Log Out | Header for a logged-in visitor | Ends the session and redirects to `#/`. |

There is currently no linked account dashboard, sponsorship-history page, password-reset page or notification centre.

## 7 Contact social channels and legal information

The footer brings together the main navigation, contact email, social channels and legal link. The CLAW brand logo also returns visitors to the home page. The IFAW logo is an image without a link.

| Link | Destination | Behaviour |
| --- | --- | --- |
| CLAW footer logo | `#/` | Returns to the home page. |
| Contact email | `mailto:CLAWsouthafrica@gmail.com` | Opens an email draft without a prefilled subject. |
| Facebook | `https://www.facebook.com/228935760482787` | Opens the configured Facebook destination in a new tab. |
| Instagram | `https://www.instagram.com/claw.jhb/` | Opens the configured Instagram destination in a new tab. |
| Terms & Conditions | `#/terms` | Opens the terms page. |

The street address, copyright text and `NPO registration: 007-416` are plain text. There is no linked map, phone number, privacy-policy page or external IFAW destination.

## 8 Registered routes and remaining link decisions

The complete user-facing route set is `#/`, `#/dogs`, `#/dogs/details`, `#/donate`, `#/signup`, `#/login`, `#/virtual-adoption` and `#/terms`. Dog-specific routes use the query parameters described above. An unrecognised route falls back to the home page.

The virtual-adoption information page at `#/virtual-adoption` is registered, but no current visitor-facing link points to it. The home-page virtual-adoption section sends visitors directly to the dog listing instead.

A legacy component-host definition contains an Adopt Now link to `#/donate?mode=adopt&dog=0`. It is not invoked by the current page layouts, and `0` is not one of the current mock dog identifiers. It should be treated as an unused definition rather than a valid dog checkout link.

Two labels deserve a later decision: View Available Pups and Browse available dogs both open a listing that also contains sponsored dogs. Either the destination should eventually apply an availability filter, or the wording should describe browsing all dogs in care.

This inventory records destinations from the current implementation. It does not certify that the external social profiles are live or that every destination has been exercised in a browser.
