var correspondenceToDelete;
var workItemId;
var workItemTypeID;
var itemId;

$(document).ready(function () {
    debugger;
    workItemId = $("#hdnCorrespondenceWorkItemID").val();
    workItemTypeID = $("#hdnCorrespondencWorkItemTypeID").val();
    const urlParams = new URLSearchParams(window.location.search);
    $("#hdnCorrespondencWorkItemTypeID").val(urlParams.get('WorkitemTypeID'));
    $("#hdnCorrespondencItemId").val(urlParams.get('ApplicationID'));

    itemId = $("#hdnCorrespondencItemId").val();
    if ($("#hdnCorrespondencWorkItemTypeID").val() == '15') {
        //document.getElementById('ItemTypeDescId').innerHTML = 'Legal ID';
        $("#CItemTypeDescId").html('Legal ID');
    }
    //document.getElementById('viewItemID').innerHTML = $("#hdnCorrespondencItemId").val();
    $("#viewCItemID").html($("#hdnCorrespondencItemId").val());
    $("#btnAddNewCorrespondence").on('click', function () {
        $.ajax({
            type: "GET",
            url: "/Process/AddCorrespondence",
            data: { "workItemId": workItemId, "itemId": itemId, "itemTypeId": workItemTypeID},
            success: function (data) {
                $("#dvCorrespondenceGrid").hide();
                $("#CorrespondenceSection").show();
                $("#CorrespondenceSection").html(data);
                $("#CorrespondenceSection").slideDown();
                $("#txtDateSent").val("");

                $("#editBTN").hide();
                $("#addBTN").show();

                $("body,html").animate({
                    scrollTop: $("#CorrespondenceSection").offset().top
                }, 800);
            },
        });
    });

    $("#correspondenceResult").on("click", "a.btn-link", function () {
        var $tr = $(this).closest("tr"),
            grid = $("#correspondenceResult").data("kendoGrid");
        correspondenceToDelete = grid.dataItem($tr);

        var dialog = $("#deleteCorrespondence");

        dialog.kendoDialog({
            width: "500px",
            title: false,
            closable: false,
            modal: true,
            content: ("<div class='text-center'>" +
                "</div>" +
                "<div class='text-left'>" +
                "This action is irreversible. Are you sure you want to proceed?" +
                "</div>"),
            actions: [
                { text: 'Cancel', action: closeDeleteDialog },
                { text: 'Yes', primary: true, action: onCorrespondencDelete }
            ],
        });

        $("#deleteCorrespondence").show();

        dialog.data("kendoDialog").open();
        return false;
    });

    $("#correspondenceResult").on("click", "a.btn-edit", function () {
        var $tr = $(this).closest("tr"),
            grid = $("#correspondenceResult").data("kendoGrid"),
            dataItem = grid.dataItem($tr);

        var correspondenceId = dataItem.CorrespondenceId;
        $.ajax({
            type: "GET",
            url: "/Process/AddCorrespondence",
            data: { "workItemId": workItemId, "itemId": itemId, "itemTypeId": workItemTypeID,"correspondenceId": correspondenceId },
            success: function (data) {
                $("#dvCorrespondenceGrid").hide();
                $("#CorrespondenceSection").show();
                $("#CorrespondenceSection").html(data);
                $("#CorrespondenceSection").slideDown();

                $("#addBTN").hide();
                $("#editBTN").show();

                $("body,html").animate({
                    scrollTop: $("#CorrespondenceSection").offset().top
                }, 800);
            },
        });
        return false;
    });
    loadCorrespondence();
    if ($('#hdnLegalCaseStatus').val() != 'undefined' && ($('#hdnLegalCaseStatus').val() == 'Case Closed' || $('#hdnLegalCaseStatus').val() == 'Case Dismissed')) {
        $("#btnAddNewCorrespondence").hide();
    }
    
});

function loadCorrespondence() {
    $.ajax({
        type: "GET",
        url: "/Process/GetCorrespondence?itemId=" + itemId + "&itemTypeId=" + workItemTypeID,
        dataType: "json",
        success: function (results) {
            if (results.length >0) {
                $("#correspondenceResult").empty();
                $("#correspondenceResult").kendoGrid({
                    toolbar: ["excel"],
                    excel: {
                        fileName: "Correspondence.xlsx",
                        allPages: true,
                    },
                    dataSource: {
                        data: results,
                        schema: {
                            model: {
                                fields: {
                                    CorrespondenceId: { type: "number" },
                                    Reason: { type: "string" },
                                    Description: { type: "string" },
                                    DateSent: { type: "date" },
                                }
                            }
                        },
                        pageSize: 5
                    },
                    scrollable: true,
                    sortable: true,
                    pageable:
                    {
                        pageSizes: [5, 10, 20],
                        numeric: false
                    },
                    filterable: {
                        extra: false,
                        operators: {
                            string: {
                                startswith: "Starts with",
                                eq: "Is equal to",
                                neq: "Is not equal to"
                            }
                        }
                    },
                    columns: [
                        { field: "CorrespondenceId", title: "CorrespondenceId", hidden: "true" },
                        { field: "Reason", title: "Reason", width: 250 },
                        { field: "Description", title: "Description", width: 350, encoded: false },
                        { field: "DateSent", title: "Date Sent", width: 100, template: "#= DateSent == null ? 'N/A' : kendo.toString(kendo.parseDate(DateSent, 'MM/dd/yyyy'),'MM/dd/yyyy') #" },
                        {
                            template: "<a href='' class='btn-edit glyphicon glyphicon-remove js-edit' title='Edit' data-customer-id= #: CorrespondenceId #><i class='k-icon k-i-edit'></i></a>",
                            field: "CorrespondenceId",
                            filterable: false,
                            sortable: false,
                            width: 80,
                            title: "Edit",
                            headerAttributes: { style: "color: #333; font-size: 15px; font-weight: 600; text-decoration: none;" }
                        },
                        {
                            template: "<a href='' class='btn-link glyphicon glyphicon-remove js-delete' title='Delete' data-customer-id= #: CorrespondenceId #><i class='text-danger k-icon k-i-delete'></i></a>",
                            field: "UserNotesid",
                            filterable: false,
                            sortable: false,
                            width: 80,
                            title: "Delete",
                            headerAttributes: { style: "color: #333; font-size: 15px; font-weight: 600; text-decoration: none;" }
                        }
                    ]
                });
            }
            else {
                if ($('#divNoRecordFoundMessage').length) {
                    disPlayNotExistMessage('No correspondence found for this record.');
                }
            }
            if ($("#hdnCorrespondencWorkItemTypeID").val() == '15') {
                $("#CItemTypeDescId").html('Legal ID');
            }
            $("#viewCItemID").html($("#hdnCorrespondencItemId").val());
        },
        error: function (xhr) {
        },
    });
}
function removeSpecialCharacters(str) {
    // Regular expression to match the specified special characters at the beginning of the string
    var regex = /^[=\+\-\@\0x09\0x0D\s]*/;
    // Remove the specified special characters from the beginning of the string
    return str.replace(regex, '');
}
function sanitizeHtml(input) {
    var sanitizedInput = '';
    if (input != null && input !== '') {
        // Define the regular expression pattern
        var pattern = /(<(?:[^\/>]+)(?:\/)?>|onerror\s*=)/gi;

        // Replace potentially harmful attributes with an empty string
        sanitizedInput = input.replace(pattern, '');
    }

    return sanitizedInput;
}
function addCorrespondence() {
    var isError = false;
    const workItem = getWorkItemType();
    if (workItem.ItemId == 0) return;
    var correspondenceId = $("#hdnCorrespondenceId").val();
    var reason = $("#txtReason").val();
    var dateSent = $("#txtDateSent").val();
    var description = $("#Correspondence_Description").val();
    description = sanitizeHtml(description);
    description = removeSpecialCharacters(description);

    if (dateSent == "") {
        document.getElementById('err_DateSent').classList.remove('hidden');
        isError = true;
    }
    else {
        document.getElementById('err_DateSent').classList.add('hidden');
    }

    if (reason == "") {
        document.getElementById('err_Reason').classList.remove('hidden');
        isError = true;
    }
    else {
        document.getElementById('err_Reason').classList.add('hidden');
    }

    if (description == "") {
        if (workItem.Code != 'LEG') {
            document.getElementById('err_Description').classList.remove('hidden');
            isError = true;
        }
    }
    else {
        document.getElementById('err_Description').classList.add('hidden');
    }

    if (isError) return;

    var paramObject = new Object();
    paramObject.CorrespondenceId = correspondenceId;
    paramObject.ItemId = itemId;
    paramObject.WorkItemID = workItemId;
    paramObject.WorkItemTypeId = workItemTypeID;
    paramObject.Reason = reason;
    paramObject.Description = description;
    paramObject.DateSent = dateSent;

    $.ajax({
        type: "POST",
        url: "/Process/SaveCorrespondence",
        data: JSON.stringify(paramObject),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            if (data == 'error') {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "Something went wrong, please try again." }, "error");
            }
            else {
                onSuccess();
                var popupNotification = $("#Notification").data("kendoNotification");
                if (correspondenceId > 0) {
                    popupNotification.show({ message: "Correspondence updated successfully." }, "success");
                }
                else {
                    popupNotification.show({ message: "Correspondence created successfully." }, "success");
                }
                if ($("#hdnCorrespondencWorkItemTypeID").val() == '15') {
                    $("#CItemTypeDescId").html('Legal ID');
                }
                $("#viewCItemID").html($("#hdnCorrespondencItemId").val());
            }
        },
        error: function () {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went wrong, please try again." }, "error");
        }
    });
}

function onSuccess() {
    RenderMenuPartialView('Correspondence');
}

function cancelCorrespondence() {
    RenderMenuPartialView('Correspondence');
}

function onCorrespondencDelete() {
    var correspondenceId = correspondenceToDelete.CorrespondenceId;

    $.ajax({
        type: "DELETE",
        url: "/Process/DeleteCorrespondence?correspondenceId=" + correspondenceId + "&itemId=" + itemId + "&itemTypeId="+workItemTypeID,
        dataType: "json",
        success: function (results) {
            if (results == 'error') {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "Something went wrong, please try again." }, "error");
            }
            else {
                RenderMenuPartialView('Correspondence');
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "Correspondence deleted successfully." }, "success");
            }
        },
        error: function () {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went wrong, please try again." }, "error");
        }
    });
}

function closeDeleteDialog() {
    $('#deleteCorrespondence').hide();
    $('#deleteCorrespondence').data("kendoDialog").close();
}