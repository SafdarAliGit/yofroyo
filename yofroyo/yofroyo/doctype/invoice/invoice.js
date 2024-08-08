frappe.ui.form.on('Invoice', {
    refresh(frm) {
        if (frm.doc.docstatus == 1) {
            // Add a custom button to the form's toolbar
            frm.add_custom_button(__('New Invoice'), function () {
                // Create a new document of type 'Invoice'
                frappe.new_doc('Invoice');
            }).addClass('btn btn-primary'); // Add Bootstrap classes for styling
        }

        // Ensure DOM is fully loaded before executing
        $(document).ready(function () {
            // Check if content is already added
            if ($('.items-list').length === 0) {
                // Fetch the item list from the Item Doctype
                frappe.call({
                    method: 'frappe.client.get_list',
                    args: {
                        doctype: 'Item',
                        fields: ['item_code', 'image', 'rate'], // Add any additional fields you need
                        filters: {
                            item_group: 'Finish' // Filter condition
                        },
                        limit_page_length: 100 // Adjust the limit as needed
                    },
                    callback: function (response) {
                        if (response.message && response.message.length) {
                            var quantity = `<input type="input" value="" name="quantity" id="quantity"  style="width: 100%;border-radius: 5px;border: solid 2px #2490ef;margin-top: 24px;font-size: 2em;padding: 4px;">`
                            var itemsList = `<ul style="list-style: none;">`;
                            response.message.forEach(function (item) {
                                itemsList += `<li style="border: solid 1.5px #2490ef; border-radius: 8px; padding: 8px; margin-bottom: 8px;" item_code="${item.item_code}" rate="${item.rate}">
                                    <b style="color:black;">${item.item_code} </b>
                                    <img src="${item.image}" width="80" height="80">
                                </li>`;
                            });
                            itemsList += `</ul>`;
                            var num_form = `<form id="num_form">
                                <input type="button" value="1" name="one" id="one" style="width: 95px; height: 80px; margin: 3px; font-size: 3.5em;">
                                <input type="button" value="2" name="two" id="two" style="width: 95px; height: 80px; margin: 3px; font-size: 3.5em;">
                                <input type="button" value="3" name="three" id="three" style="width: 95px; height: 80px; margin: 3px; font-size: 3.5em;">
                                <input type="button" value="4" name="four" id="four" style="width: 95px; height: 80px; margin: 3px; font-size: 3.5em;">
                                <input type="button" value="5" name="five" id="five" style="width: 95px; height: 80px; margin: 3px; font-size: 3.5em;">
                                <input type="button" value="6" name="six" id="six" style="width: 95px; height: 80px; margin: 3px; font-size: 3.5em;">
                                <input type="button" value="7" name="seven" id="seven" style="width: 95px; height: 80px; margin: 3px; font-size: 3.5em;">
                                <input type="button" value="8" name="eight" id="eight" style="width: 95px; height: 80px; margin: 3px; font-size: 3.5em;">
                                <input type="button" value="9" name="nine" id="nine" style="width: 95px; height: 80px; margin: 3px; font-size: 3.5em;">
                                <input type="button" value="del" name="del" id="del" style="width: 95px; height: 80px; margin: 3px; font-size: 3.5em;">
                                <input type="button" value="0" name="0" id="zero" style="width: 200px; height: 80px; margin: 3px; font-size: 3.5em;">
                            </form>`;
                            // Insert the items list and number form
                            $('.section-body .col-sm-6').eq(1).find('form').append(`<div style="width: 100%">${quantity}<div style="overflow-y: auto; width: 40%; float: left;padding-top: 8px; box-sizing: border-box;" class="items-list">${itemsList}</div><div style="width: 60%; float: left; padding: 6px; box-sizing: border-box;" class="num-form">${num_form}</div></div>`);

                            // Initialize event handlers
                            initEventHandlers(frm);
                        } else {
                            $('.section-body .col-sm-6').eq(1).find('form').append('<p>No items found.</p>');
                        }
                    }
                });
            } else {
                // If content already exists, reinitialize event handlers
                initEventHandlers(frm);
            }
        });
    },
    paid_amount: function (frm) {
        calucateTotal(frm);
    }
});

// Function to initialize event handlers
function initEventHandlers(frm) {
    $(document).off('click', '.items-list li').on('click', '.items-list li', function () {
        var itemCode = $(this).attr('item_code');
        var itemRate = $(this).attr('rate');
        addItemToChildTable(frm, itemCode, itemRate);
        calucateTotal(frm);
    });
    // Add event listener for keypad
    $(document).off('click', '#num_form input[type="button"]:not([name="del"])').on('click', '#num_form input[type="button"]:not([name="del"])', function () {
        var value = $(this).val();
        var current = String(frm.doc.paid_amount || '');
        frm.set_value("paid_amount", current + value);
        calucateTotal(frm);
    });

    $(document).off('click', '#num_form input[name="del"]').on('click', '#num_form input[name="del"]', function () {
        var current = String(frm.doc.paid_amount || '');
        frm.set_value("paid_amount", current.slice(0, -1));
        calucateTotal(frm);
    });
    $(document).off('click', '.grid-remove-rows"]').on('click', '.grid-remove-rows', function () {
        calucateTotal(frm);
    });
}

// Function to add item to the child table
function addItemToChildTable(frm, itemCode, itemRate) {
    var child_table_field = 'items'; // Replace with your actual field name

    // Ensure the child table field exists and is accessible
    if (frm.fields_dict[child_table_field]) {
        // Check if the child table field is initialized in the form's document
        if (!frm.doc[child_table_field]) {
            frm.doc[child_table_field] = [];
        }

        // Check if the item code is already in the child table
        var existingItem = frm.doc[child_table_field].find(row => row.item === itemCode);

        if (!existingItem) {
            // Add a new row to the child table
            var new_row = frm.add_child(child_table_field, {
                item: itemCode,
                qty: frm.doc.quantity || 1,
                rate: itemRate,
                amount: itemRate * (frm.doc.quantity || 1)
            });
            frm.refresh_field(child_table_field); // Refresh the child table to show the new row
        } else {
            frappe.msgprint(__('Item already exists in the list.'));
        }
    } else {
        frappe.msgprint(__('Child table field is not defined.'));
    }

}

function calucateTotal(frm) {
    var grand_total = 0;
    $.each(frm.doc.items || [], function (i, d) {
        grand_total += flt(d.amount);
    });
    frm.set_value("grand_total", grand_total);
    //to be paid calculation
    var paid_amount = frm.doc.paid_amount || 0;
    var to_be_paid = paid_amount - grand_total;
    // if (to_be_paid < 0) {
    //     to_be_paid = 0;
    // }
    frm.set_value("to_be_paid", to_be_paid);
}

// Initialize custom styles
$(document).ready(function () {
    $('.form-control').css({
        'border': 'solid 2px #2490ef',
        'font-size': '2em'
    });
    $('.control-value.like-disabled-input').css({
        'border': 'solid 2px #2490ef',
        'font-size': '2em'
    });
    $('.row.form-section.card-section.visible-section').css({
        'background-color': '#8beec6',
        'border-radius': '8px'
    });
    $('#page-Invoice').css({
        'background-color': '#c9f1e1'
    });
    $('.page-head.flex').css({
        'background-color': '#c9f1e1'
    });
    $('.navbar.navbar-expand.sticky-top').css({
        'background-color': '#64a8ec',
        'color': '#ffffff'
    });
    $('.page-head.flex.drop-shadow').css({
        'background-color': '#4becab'
    });
    $('.form-grid').css({
        'background-color': '#64a8ec'
    });
    $('.data-row.row').css({
        'background-color': '#64a8ec'
    });
    $('.no-breadcrumbs').css({
        'background-color': '#c9f1e1'
    });
    $('.btn-primary').css({
        'font-weight': 'bold'
    });

});
