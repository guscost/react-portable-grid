// Portable Grid v0.7.3
// © 2018 Gus Cost
// MIT license

(function (r, f) {
  if (typeof exports === "object" && typeof module !== "undefined") {
    module.exports = f(require("react"), require("prop-types"), require("create-react-class"));
  } else if (typeof define === "function" && define.amd) {
    define(["react", "prop-types", "create-react-class"], function (a, b, c) {
      return (r.PortableGrid = f(a, b, c));
    });
  } else {
    r.PortableGrid = f(r.React, r.PropTypes, r.createReactClass);
  }
}(this, function (React, PropTypes, createReactClass) {

  // alias for React.createElement
  var el = React.createElement;

  // constant styles for static proportions
  var _rowSpacerStyle = {
    padding: "7px",
    boxSizing: "border-box",
    whiteSpace: "pre-wrap",
    userSelect: "none",
    MozUserSelect: "none",
    MsUserSelect: "none",
    WebkitUserSelect: "none"
  };
  var _pagerForwardButtonContainerStyle = {
    position: "absolute",
    right: "1px",
    width: "64px"
  };
  var _pagerBackButtonContainerStyle = {
    position: "absolute",
    left: "4px"
  };
  var _pagerPageContainerStyle = {
    position: "absolute",
    left: "100px",
    height: "32px",
    lineHeight: "32px"
  };

  // these will get passed in to the onClickHeader function for use if needed
  var _defaultSortOrderUpdate = function (sortOrder) {
    return sortOrder ? (sortOrder === "down" ? undefined : "down") : "up";
  };
  var _defaultSort = function (field, sort, a, b) {
    if (!sort) { field = "id"; }
    var valueA = a[field];
    var valueB = b[field];
    if (sort === "down") { return valueA < valueB ? 1 : (valueA > valueB ? -1 : 0); }
    else { return valueA > valueB ? 1 : (valueA < valueB ? -1 : 0); }
  };

  return createReactClass({

    // name for debugging
    displayName: "PortableGrid",

    // data prop should be an array of data objects
    // columns prop should be an array of column definitions
    // each data item should have keys matching "field" from each column
    // alternatively a column can specify a "template" function that takes the row item
    // to scope these functions correctly, a scope prop should be passed in
    // data items can include _rowSelected key to set whether the row is selected
    // data items can include _rowBackground key to set the row background color
    propTypes: PropTypes ? {
      data: PropTypes.arrayOf(
        PropTypes.shape({
          _rowSelected: PropTypes.bool,
          _rowBackground: PropTypes.string
        })
      ).isRequired,
      columns: PropTypes.arrayOf(
        PropTypes.shape({
          title: PropTypes.string.isRequired,
          width: PropTypes.string.isRequired,
          field: PropTypes.string,
          template: PropTypes.func,
          sort: PropTypes.oneOf(["up", "down"])
        })
      ).isRequired,
      detail: PropTypes.func,
      headerVisible: PropTypes.bool,
      currentPage: PropTypes.number,
      pageSize: PropTypes.number,
      onChangePage: PropTypes.func,
      onClickHeader: PropTypes.func,
      onClickRow: PropTypes.func,
      scope: PropTypes.object // typically a reference to the parent component
    } : null,

    componentDidUpdate: function () {
      if (this.refs.page) { this.refs.page.value = this.props.currentPage; }
    },
    getDefaultProps: function () {
      return {
        headerVisible: true,
        headerBackgroundColor: "#263248",
        headerBorderColor: "#555555",
        headerTextColor: "#FFFFFF",
        pagerBackgroundColor: "#F1F1F1",
        pagerButtonBackgroundColor: "#DFDFDF",
        pagerButtonActiveBackgroundColor: "#CECECE",
        pagerButtonBorderColor: "#CCCCCC",
        pagerButtonActiveBorderColor: "#AAAAAA",
        pagerButtonTextColor: "#333333",
        pagerPageInputBorderColor: "#CCCCCC",
        pagerPageInputActiveBorderColor: "#AAAAAA",
        rowEvenBackgroundColor: "#F9F9F9",
        rowOddBackgroundColor: "#FFFFFF",
        rowSelectedBackgroundColor: "#FFFFDD",
        rowSelectedBorderColor: "#DDDDDD"
      };
    },

    // handlers for buttons
    _onButtonActivate: function (event) {
      event.target.style.backgroundColor = this.props.pagerButtonActiveBackgroundColor;
      event.target.style.border = "1px solid " + this.props.pagerButtonActiveBorderColor;
      event.target.style.zIndex = 1;
    },
    _onButtonDeactivate: function (event) {
      event.target.style.backgroundColor = this.props.pagerButtonBackgroundColor;
      event.target.style.border = "1px solid " + this.props.pagerButtonBorderColor;
      event.target.style.zIndex = 0;
    },

    // handlers for page change buttons
    _onFirstPage: function () {
      this.props.onChangePage(1);
    },
    _onPreviousPage: function () {
      this.props.onChangePage(Math.max(this.props.currentPage - 1, 1));
    },
    _onNextPage: function () {
      this.props.onChangePage(
        Math.min(
          this.props.currentPage + 1,
          Math.ceil((this.props.data.length || 1) / this.props.pageSize)
        )
      );
    },
    _onLastPage: function () {
      this.props.onChangePage(Math.ceil((this.props.data.length || 1) / this.props.pageSize));
    },

    // handlers for the page input box
    _onInputPage: function (event) {
      var sanitizedValue = isNaN(parseFloat(event.target.value)) ? 1 : event.target.value;
      this.props.onChangePage(Math.floor(Math.min(
        Math.max(sanitizedValue, 1),
        Math.ceil((this.props.data.length || 1) / this.props.pageSize)
      )));
    },
    _onKeyPage: function (event) {
      if (event.key === "Enter") {
        this._onInputPage(event);
      }
    },
    _onFocusPage: function (event) {
      event.target.style.border = "1px solid " + this.props.pagerPageInputActiveBorderColor;
    },
    _onBlurPage: function (event) {
      event.target.style.border = "1px solid " + this.props.pagerPageInputBorderColor;
      this._onInputPage(event);
    },

    // render function
    render: function () {
      var component = this;

      var previousRowSelected = false;
      var hasOnClickHeader = !!component.props.onClickHeader;
      var hasOnClickRow = !!component.props.onClickRow;

      // styles for pager
      var pagerStyle = {
        position: "relative",
        width: "100%",
        backgroundColor: component.props.pagerBackgroundColor,
        height: "38px",
        paddingTop: "3px",
        boxSizing: "border-box"
      };
      var pagerButtonStyle = {
        boxSizing: "border-box",
        fontSize: "1em",
        width: "32px",
        height: "32px",
        lineHeight: "16px",
        padding: "1px 7px",
        margin: "0px 0px 0px -1px",
        position: "relative",
        backgroundColor: component.props.pagerButtonBackgroundColor,
        border: "1px solid " + component.props.pagerButtonBorderColor,
        outline: "none",
        color: component.props.pagerButtonTextColor,
        cursor: "pointer",
        appearance: "none",
        MozAppearance: "none",
        WebkitAppearance: "none"
      };
      var pagerPageInputStyle = { 
        display: "inline-block",
        boxSizing: "border-box",
        border: "1px solid " + component.props.pagerPageInputBorderColor,
        outline: "none",
        width: "50px",
        height: "32px",
        fontSize: "1em",
        lineHeight: "22px",
        paddingLeft: "7px"
      };

      // styles for sort direction indicator
      var sortIndicatorText = { "up": "▲", "down": "▼" };
      var sortIndicatorStyle = {
        backgroundColor: component.props.headerBackgroundColor,
        fontSize: ".8em",
        position: "absolute",
        right: "8px",
        top: "8px"
      };

      // pre-process page of data to display
      var dataPage;
      var pagerVisible = false;
      if (component.props.pageSize && component.props.currentPage) {
        var firstIndex = (component.props.currentPage - 1) * component.props.pageSize;
        dataPage = component.props.data.slice(firstIndex, firstIndex + component.props.pageSize);
        pagerVisible = true;
        while (dataPage.length < component.props.pageSize) { dataPage.push(null); }
      } else {
        dataPage = component.props.data;
      }

      // render grid
      return React.createElement("div", {
        className: component.props.className,
        style: { width: "auto" }
      },
        el("div", {
          className: "dataTableHeader",
          style: {
            backgroundColor: component.props.headerBackgroundColor,
            border: "1px solid " + component.props.headerBackgroundColor,
            overflowX: "hidden",
            whiteSpace: "nowrap",
            boxSizing: "border-box",
            userSelect: "none",
            MozUserSelect: "none",
            MsUserSelect: "none",
            WebkitUserSelect: "none"
          }
        },
          // generate a react element for each column header
          component.props.columns.map(function (column, index) {

            // column header style
            var dataTableColumnHeaderStyle = {
              cursor: hasOnClickHeader ? "pointer" : null,
              width: column.width,
              position: "relative",
              display: "inline-block",
              padding: "6px 7px",
              overflowX: "hidden",
              whiteSpace: "nowrap",
              boxSizing: "border-box",
              borderLeft: "1px solid " + (index > 0 ? 
                component.props.headerBorderColor :
                component.props.headerBackgroundColor),
              color: component.props.headerTextColor,
              verticalAlign: "middle" // overflow fix: http://stackoverflow.com/questions/23529369/
            };

            // return column header
            return el("div", {
              style: dataTableColumnHeaderStyle,
              key: index,
              onClick: hasOnClickHeader ? component.props.onClickHeader.bind(
                component.props.scope,
                column,
                _defaultSortOrderUpdate,
                _defaultSort
              ) : null
            },
              column.title || el("div", { dangerouslySetInnerHTML: { __html: "&nbsp;" } }),
              column.sort ? el("span", { style: sortIndicatorStyle },
                sortIndicatorText[column.sort]
              ) : null
            );
          })
        ),
        dataPage.map(function (item, rowIndex) {

          // render spacer row if data item is null
          if (!item) { 
            return el("div", { key: rowIndex, style: _rowSpacerStyle }, el("div", null, " "));
          }

          // row class
          var rowClass = item._rowSelected ? "bold" : "";

          // row background color
          // to highlight row, set "_rowSelected" property on data object
          // otherwise rows render with alternate shading
          var rowBackgroundColor = (item._rowBackground ? item._rowBackground :
            (item._rowSelected ? component.props.rowSelectedBackgroundColor :
              (rowIndex % 2 === 1 ? component.props.rowOddBackgroundColor :
                component.props.rowEvenBackgroundColor)));

          // row container class
          var rowContainerClass = "dataTableRow"
            + (hasOnClickRow ? " clickable" : "");

          // row container style has border when selected
          var rowContainerStyle = {
            borderStyle: "solid",
            borderColor: item._rowSelected ? 
              component.props.rowSelectedBorderColor : rowBackgroundColor,
            borderWidth: (previousRowSelected ? "0px" : "1px") + " 1px 1px 1px",
            overflowX: "hidden",
            whiteSpace: "nowrap",
            boxSizing: "border-box"
          };

          // row detail has dotted border on top
          var rowDetailStyle = {
            borderTop: "1px dotted " + component.props.rowSelectedBorderColor
          };

          // save if row was selected to render top border of next row
          previousRowSelected = item._rowSelected;

          // row container
          return el("div", {
            key: rowIndex,
            className: rowContainerClass,
            style: rowContainerStyle,
            onClick: hasOnClickRow ?
              component.props.onClickRow.bind(component.props.scope, item) : null
          },
            el("div", {
              className: rowClass,
              style: { backgroundColor: rowBackgroundColor }
            },
              // generate a react element for each column
              component.props.columns.map(function (column, columnIndex) {

                // run the column template if it exists (pass in component as this)
                // otherwise return the value for the column key
                var hasTemplate = !!column.template;
                var contents = hasTemplate ?
                  column.template.call(component.props.scope, item) :
                  item[column.field];

                // special case: convert to string if zero
                if (contents === 0) { contents = "0"; }

                // column style
                var columnStyle = {
                  display: "inline-block",
                  width: column.width,
                  textAlign: column.align || "left",
                  padding: column.padding || "6px 7px",
                  overflowX: "hidden",
                  whiteSpace: "nowrap",
                  boxSizing: "border-box",
                  verticalAlign: "middle"
                };

                // return column
                return el("div", {
                  style: columnStyle,
                  key: columnIndex
                },
                  contents ||
                  el("div", { dangerouslySetInnerHTML: { __html: "&nbsp;" } })
                );
              })
            ),

            // render detail row if property exists
            (item._rowSelected && component.props.detail) ? el("div", {
              style: rowDetailStyle
            },
              component.props.detail.call(component.props.scope, item)
            ) : null
          );
        }),

        // render pager if data is longer than page size
        pagerVisible ? el("div", { style: pagerStyle },
          el("div", { style: _pagerBackButtonContainerStyle },
            el("div", null,
              el("input", {
                type: "button",
                value: "«",
                style: pagerButtonStyle,
                onClick: component._onFirstPage,
                onMouseDown: component._onButtonActivate,
                onMouseUp: component._onButtonDeactivate,
                onMouseOut: component._onButtonDeactivate
              }),
              el("input", {
                type: "button",
                value: "‹",
                style: pagerButtonStyle,
                onClick: component._onPreviousPage,
                onMouseDown: component._onButtonActivate,
                onMouseUp: component._onButtonDeactivate,
                onMouseOut: component._onButtonDeactivate
              })
            )
          ),
          el("div", { style: _pagerPageContainerStyle },
            "Page ",
            el("div", { style: { display: "inline-block", width: "50px", height:"32px" } },
              el("input", {
                type: "text",
                ref: "page",
                style: pagerPageInputStyle,
                defaultValue: component.props.currentPage,
                onKeyDown: component._onKeyPage,
                onFocus: component._onFocusPage,
                onBlur: component._onBlurPage
              })
            ),
            " of ",
            Math.ceil((component.props.data.length || 1) / component.props.pageSize)
          ),
          el("div", { style: _pagerForwardButtonContainerStyle },
            el("div", null,
              el("input", {
                type: "button",
                value: "›",
                style: pagerButtonStyle,
                onClick: component._onNextPage,
                onMouseDown: component._onButtonActivate,
                onMouseUp: component._onButtonDeactivate,
                onMouseOut: component._onButtonDeactivate
              }),
              el("input", {
                type: "button",
                value: "»",
                style: pagerButtonStyle,
                onClick: component._onLastPage,
                onMouseDown: component._onButtonActivate,
                onMouseUp: component._onButtonDeactivate,
                onMouseOut: component._onButtonDeactivate
              })
            )
          )
        ) : null
      );
    }
  });
}));
