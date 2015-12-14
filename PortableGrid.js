// Portable Grid component
// c) 2015 Gus Cost
// may be freely distributed under the MIT license

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD module (also saved as global)
    define(function () {
      return (root.PortableGrid = factory());
    });
  } else if (typeof exports === 'object') {
    // Node-flavored CommonJS
    module.exports = factory();
  } else {
    // Browser global
    root.PortableGrid = factory();
  }
}(this, function () {

    // alias for React.createElement
    var el = React.createElement;

    // constant style for table header row
    var _dataTableHeaderStyle = {
        backgroundColor: "#263248",
        border: "1px solid #263248",
        whiteSpace: "nowrap",
        overflowX: "hidden"
    };

    // constant style for row detail container
    var _rowDetailStyle = {
        borderTop: "1px dotted #BBB"
    };
    
    // constant styles for pager
    var _pagerStyle = {
        position: "relative",
        width: "100%",
        backgroundColor: "#eee",
        height: "40px",
        paddingTop: "3px"
    };
    
    var _pagerForwardButtonsStyle = { position: "absolute", right: "4px", width: "60px" };
    var _pagerBackButtonsStyle = { position: "absolute", left: "4px" };
    var _pagerPageStyle = { position: "absolute", left: "100px" };

    return React.createClass({

        // name for debugging
        displayName: "PortableGrid",

        // data prop should be an array of data objects
        // columns prop should be an array of column definitions
        // each data item should have keys matching "field" from each column
        // alternatively a column can specify a "template" function that takes the row item
        // to scope these functions correctly, a scope prop should be passed in
        // data items can include _rowSelected key to set whether the row is selected        
        // data items can include _rowBackground key to set the row background color
        propTypes: {
            data: React.PropTypes.arrayOf(
                React.PropTypes.shape({
                    _rowSelected: React.PropTypes.bool,
                    _rowBackground: React.PropTypes.string
                })
            ).isRequired,
            columns: React.PropTypes.arrayOf(
                React.PropTypes.shape({
                    title: React.PropTypes.string.isRequired,
                    width: React.PropTypes.string.isRequired,
                    field: React.PropTypes.string,
                    template: React.PropTypes.func
                })
            ).isRequired,
            details: React.PropTypes.func,
            currentPage: React.PropTypes.number,
            pageSize: React.PropTypes.number,
            onChangePage: React.PropTypes.func,
            onClickHeader: React.PropTypes.func,
            onClickRow: React.PropTypes.func,
            scope: React.PropTypes.object // typically a reference to the parent component
        },

        componentWillReceiveProps: function (nextProps, nextState) {
            this.refs.page.value = nextProps.currentPage;
        },
        
        _onFirstPage: function () {
            this.props.onChangePage(1);
        },
        _onPreviousPage: function () {
            this.props.onChangePage(Math.max(this.props.currentPage - 1, 1));
        },
        _onNextPage: function () {
            this.props.onChangePage(
                Math.min(this.props.currentPage + 1, Math.ceil((this.props.data.length || 1) / this.props.pageSize))
            );
        },
        _onLastPage: function () {
            this.props.onChangePage(Math.ceil((this.props.data.length || 1) / this.props.pageSize));
        },

        _onKeyPage: function (event) {
            if (event.key === "Enter") {
                this._onInputPage(event);
            }
        },
        _onInputPage: function (event) {
            var sanitizedValue = isNaN(parseFloat(event.target.value)) ? 1 : event.target.value;
            this.props.onChangePage(
                Math.floor(Math.min(Math.max(sanitizedValue, 1), Math.ceil((this.props.data.length || 1) / this.props.pageSize)))
            );
        },
        
        // render function
        render: function () {

            var component = this;

            var headerBackgroundColor = component.props.headerBackgroundColor || "#263248";
            var headerBorderColor = component.props.headerBorderColor || "#555555";

            var dataPageFirstIndex = (component.props.currentPage - 1) * component.props.pageSize;
            var dataPage = component.props.data.slice(
                dataPageFirstIndex, 
                dataPageFirstIndex + component.props.pageSize
            );

            return React.createElement("div", {
                className: component.props.className,
                style: { width: "auto" }
            },
                el("div", {
                    className: "dataTableHeader",
                    style: {
                        backgroundColor: headerBackgroundColor,
                        border: "1px solid " + headerBackgroundColor,
                        whiteSpace: "nowrap",
                        overflowX: "hidden"
                    }
                },
                    // generate a react element for each column header
                    component.props.columns.map(function (column, index) {

                        // column header style
                        var dataTableColumnHeaderStyle = {
                            width: column.width,
                            display: "inline-block",
                            padding: "6px 7px",
                            whiteSpace: "nowrap",
                            borderLeft: "1px solid " + (index > 0 ? headerBorderColor : headerBackgroundColor),
                            color: "#FFFFFF"
                        };

                        // return column header
                        return el("div", {
                            style: dataTableColumnHeaderStyle,
                            key: index,
                            onClick: component.props.onClickHeader ?
                                component.props.onClickHeader.bind(component.props.scope, column) : null
                        },
                            column.title ||
                            el("div", { dangerouslySetInnerHTML: { __html: "&nbsp;" } })
                        );
                    })
                ),
                dataPage.map(function (item, rowIndex) {

                    // row class
                    var rowClass = item._rowSelected ? "bold" : "";

                    // row background color
                    // to highlight row, set "_rowSelected" property on data object
                    // otherwise rows render with alternate shading
                    var rowBackgroundColor = (item._rowBackground ? item._rowBackground :
                        (item._rowSelected ? "#FFFFDD" :
                            (rowIndex % 2 === 1 ? "#FFFFFF" :
                                "#F9F9F9")));

                    // row container class
                    var rowContainerClass = "dataTableRow"
                        + (component.props.onClickRow ? " clickable" : "");

                    // row container style has border when selected
                    var rowContainerStyle = {
                        border: "1px solid " + (item._rowSelected ? "#DDDDDD" : rowBackgroundColor),
                        whiteSpace: "nowrap",
                        overflowX: "hidden"
                    };

                    // row container
                    return el("div", {
                        key: rowIndex,
                        className: rowContainerClass,
                        style: rowContainerStyle,
                        onClick: component.props.onClickRow ?
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
                                var contents = column.template ?
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
                                    whiteSpace: "nowrap",
                                    overflowX: "hidden", 
                                    // overflow fix: http://stackoverflow.com/questions/23529369/why-does-x-overflowhidden-cause-extra-space-below
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
                        (item._rowSelected && component.props.details) ? el("div", {
                            style: _rowDetailStyle
                        },
                            component.props.details.call(component.props.scope, item)
                        ) : null
                    );
                }),
                
                // render pager if data is longer than page size
                component.props.data.length > component.props.pageSize ? (
                    el("div", {
                        style: _pagerStyle
                    },
                        el("div", { style: _pagerBackButtonsStyle },
                            el("div", { className: "input-group-btn" },
                                el("button", {
                                    className: "btn btn-default",
                                    type: "button",
                                    onClick: component._onFirstPage
                                },
                                    el("span", {
                                        ariaHidden: "true"
                                    }, "«")
                                ),
                                el("button", {
                                    className: "btn btn-default",
                                    type: "button",
                                    onClick: component._onPreviousPage
                                },
                                    el("span", {
                                        ariaHidden: "true"
                                    }, "‹")
                                )
                            )
                        ),
                        el("div", { style: _pagerPageStyle },
                            "Page ",
                            el("div", { style: { display: "inline-block", width: "50px", marginBottom: "-12px" } },
                                el("input", {
                                    type: "text",
                                    className: "form-control",
                                    ref: "page",
                                    defaultValue: component.props.currentPage,
                                    onKeyDown: component._onKeyPage,
                                    onBlur: component._onInputPage
                                })
                            ),
                            " of ",
                            Math.ceil((component.props.data.length || 1) / component.props.pageSize)
                        ),
                        el("div", { style: _pagerForwardButtonsStyle },
                            el("div", { className: "input-group-btn" },
                                el("button", {
                                    className: "btn btn-default",
                                    type: "button",
                                    onClick: component._onNextPage
                                },
                                    el("span", {
                                        ariaHidden: "true"
                                    }, "›")
                                    ),
                                el("button", {
                                    className: "btn btn-default",
                                    type: "button",
                                    onClick: component._onLastPage
                                },
                                    el("span", {
                                        ariaHidden: "true"
                                    }, "»")
                                )
                            )
                        )
                    )
                ) : null
            );
        }
    });
}));