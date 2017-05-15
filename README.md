# Polaris

Polaris is the codename for the universal Header, Footer &amp; Toast notifications for XFINITY Websites.
This repo contais the Vanilla Web Components for those 3 custom elements.

## How to Set up Your Development Environment

1. Install Yarn

     Follow the instructions at https://yarnpkg.com/docs/install

5. Install Polaris dependencies:

        `yarn`

6. Start the server:

        `yarn start`

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
