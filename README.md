# react-portable-grid
A portable grid for ReactJS

## Getting Started
Check here: https://guscost.github.io/react-portable-grid/ to see a demo with paging, sorting, column templates, and a row detail template with editing. 

## Summary
This simple grid is designed to be dropped into any React component, as a stateless grid that gets passed all its data and settings as props. It also supports template columns and expandable detail rows, with fully customizable interactive contents. The containing component will typically pass itself into the grid as a `scope` prop, so all template functions will execute in the context of the containing component. This means handlers and callbacks used by the template functions can be located in the containing component, and do not need to be passed into the grid along with the data and templates. For applications where simple grids have to be added to many different contexts, this component (or a similar component customized for that application) can be very easy to set up and use wherever it is needed. Note that this implemenation is not optimized for large data sets and does not yet support any kind of dynamic data loading or infinite scrolling.

## Supported Features

- Mostly automatic paging (you have to pass in the current page and a callback to change pages)
- Kind-of automatic sorting (you have to sort the `data` and update the `columns`, but default helpers are made available by the grid)
- Column `template`s (functions that take the row data item, execute with `this` set to the `scope` prop, and return strings or React elements)
- Row `detail` template (same usage as above)