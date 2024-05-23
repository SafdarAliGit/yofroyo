frappe.ui.form.on('Daily Production', {
    refresh: function (frm) {
        if (frm.is_new()) {
            frm.set_value('date', frappe.datetime.now_datetime());
        }
        frm.set_query('finish_item', function () {
            return {
                filters: {
                    'item_group': 'Finish'
                }
            };
        });
        frm.set_query('item_code', 'raw_materials', function (doc, cdt, cdn) {
            var d = locals[cdt][cdn];
            return {
                filters: [
                    ["Item", "item_group", "=", "Raw Material"]
                ]
            };
        });
    }

});
frappe.ui.form.on('Daily Production Items', {
    qty: function (frm, cdt, cdn) {
        calculate_amount(frm, cdt, cdn);
    },
    rate: function (frm, cdt, cdn) {
        calculate_amount(frm, cdt, cdn);
    }

});


function calculate_amount(frm, cdt, cdn) {
    var row = locals[cdt][cdn];
    frappe.model.set_value(cdt, cdn, 'amount', row.qty * row.rate);
    calculate_total_amount_total_qty(frm, cdt, cdn);
}

function calculate_total_amount_total_qty(frm, cdt, cdn) {
    var total_qty = 0;
    var total_amount = 0;
    $.each(frm.doc.raw_materials || [], function (i, d) {
        total_qty += flt(d.qty);
        total_amount += flt(d.amount);
    });
    frm.set_value('total_qty', total_qty);
    frm.set_value('total_amount', total_amount);
}
