# Polaris

Polaris is the codename for the universal Header, Footer &amp; Toast notifications for XFINITY Websites.

This repo contains the Vanilla Web Components for those 3 custom elements. We released this
to provide an example of how you can build and deploy web components to share across multiple
projects. This project is not maintained and only serves as an example. If you're interested
in learning more about web components, check out [Open WC](https://open-wc.org)

## How to Set up Your Development Environment

`npm i`
`npm start`

## Testing

        `yarn test`

#### JavaScript Unit Testing

Polaris uses [Web Component Tester](https://github.com/Polymer/web-component-tester) as its JavaScript testing framework.

You can run WCT using `yarn test` or `wct` - install wct globally first with `yarn global add wct`

#### JavaScript Code Coverage

Polaris uses [Istanbul](http://gotwarlost.github.io/istanbul/) in tracing JavaScript code coverage.

How to generate code coverage:

1. Run a test `yarn test`

2. View the report in your browser:

    open coverage/index.html

## Building for Release

        `yarn build`
