// Copyright (c) 2024, TechVentures and contributors
// For license information, please see license.txt

frappe.ui.form.on('Daily Dispose Off', {
    refresh: function (frm) {
        if (frm.is_new()) {
            frm.set_value('date', frappe.datetime.now_datetime());
        }
        frm.set_query('item_code', 'daily_dispose_off_items', function (doc, cdt, cdn) {
            var d = locals[cdt][cdn];
            return {
                filters: [
                    ["Item", "item_group", "=", "Dispose Off"]
                ]
            };
        });
    }

});
frappe.ui.form.on('Daily Dispose Off Items', {
    item_code: function (frm, cdt, cdn) {

        var row = locals[cdt][cdn];
        frappe.call({
            method: 'yofroyo.yofroyo.utils.get_stock_balance.get_stock',
            args: {
                item_code: row.item_code,
                warehouse: frm.doc.warehouse
            },
            callback: function (r) {
                if (r.message) {
                    frappe.model.set_value(cdt, cdn, 'available_qty', r.message);
                } else {
                    frappe.msgprint('No Data Found');
                }
            }
        });
    },
    current_qty: function (frm, cdt, cdn) {
        var row = locals[cdt][cdn];
        frappe.model.set_value(cdt, cdn, 'consumed_qty', row.available_qty - row.current_qty);
        calculate_amount(frm, cdt, cdn);
    },
    rate: function (frm, cdt, cdn) {
        calculate_amount(frm, cdt, cdn);
    }

});


function calculate_amount(frm, cdt, cdn) {
    var row = locals[cdt][cdn];
    frappe.model.set_value(cdt, cdn, 'amount', row.consumed_qty * row.rate);
    calculate_total_amount_total_consumed_qty(frm, cdt, cdn);
}

function calculate_total_amount_total_consumed_qty(frm, cdt, cdn) {
    var total_consumed_qty = 0;
    var total_amount = 0;
    $.each(frm.doc.daily_dispose_off_items || [], function (i, d) {
        total_consumed_qty += flt(d.consumed_qty);
        total_amount += flt(d.amount);
    });
    frm.set_value('total_consumed_qty', total_consumed_qty);
    frm.set_value('total_amount', total_amount);
}
