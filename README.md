# react-portable-grid
A portable grid for ReactJS

## Getting Started
Check out the demo here: https://guscost.github.io/react-portable-grid/ to see a demo withs paging, sorting, column templates, and a row detail template with editing. 

## Summary
This simple grid is designed to be dropped into any React component, and to be a stateless grid that is passed all its data and settings as props. It also supports templating columns and expanded row details, with fully customizable interactive contents. The containing component will typically pass itself in as a `scope` prop, so all template functions will execute in the context of the containing component. This means all handlers and callbacks can be located in the containing component, and do not have to be passed into the grid along with the data and templates. For applications where simple grids have to be added to many different contexts, this component (or a similar component customized for that application) can be very easy to set up and use wherever it is needed. Note that this implemenation is not optimized for very large data sets and does not yet support any kind of dynamic data loading or infinite scrolling.

## Supported Features

- Mostly automatic paging (you have to pass in the current page and a callback to change pages)
- Kind-of automatic sorting (you have to sort the data and update the column but default helpers are made available by the grid)
- Column templates (functions that take the row data item, are scoped to the `scope` prop, and return strings or React elements)
- Row template prop (same usage as above)