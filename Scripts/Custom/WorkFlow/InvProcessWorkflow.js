var selectedView = '';
var oneEventRunning = false;
var PrincipalPartyID = 0;
var subjectType = '';
var subjectId = 0;
var violations;
var adminSettlementViolations;
var criminalSettlementViolations;
var noticeNumberExists = false;
var selectedInvestigationId = 0;
var idField = "ViolationId";
var selectedViolationLst = [];
var itemsToSelect = [];
var selectedRows = [];
var isRowSelected = [];
var caseId = 0;
var adminViolations;
var criminalViolations;
var licNumber = 0;
var arrUploadedFileIDs;
var SettlementId = 0;
var adminNoticeNumber = '';
var selectedInvestigationID = 0;
var selectedOAGNoteId = 0;
var caseAppointmentList = [];
var lrFilesCount = 0;
var sendDocToLicenseeData = [];
var legalCaseId = 0;
var sourceRecordType = '';


$(document).ready(function () {

    caseId = $("#hdnApplicationId").val();
    caseTypeId = $("#hdnCaseTypeId").val();
    var workItemType = $("#hdnWorkItemTypeID").val();
    var workItemID = $("#hdnWorkItemID").val();
    var workItemTypeId = $("#hdnWorkItemTypeIDs").val();
    var hasAccess = $("#hdnHasAccess").val();

    selectedInvestigationId = document.getElementById("viewDispositionRecommendationID").innerHTML;
    //if (hasAccess == 'False') {
    //    var popupNotification = $("#Notification").data("kendoNotification");
    //    popupNotification.show({ message: "You don't have permissions to view this record." }, "info");
    //    return;
    //}

    if (workItemType != 'LEG' && !document.getElementById('viewDispositionData_ReadOnly').classList.add('hidden'))
        previewInvCaseOverviewInformation_ReadOnly();
    else
        previewLegalInvCaseOverviewInformation_ReadOnly();


    $("#btnDismissViolation").on('click', function () {
        if (selectedRows.length > 0) {
            var dialog = $("#delete");
            dialog.kendoDialog({
                width: "500px",
                title: false,
                closable: false,
                modal: true,
                content: ("<div class='text-center'>" +
                    "</div>" +
                    "<div class='text-center'>" +
                    "Are you sure you want to dismiss this violation?" +
                    "</div>"),
                actions: [
                    { text: 'Cancel', action: closeDismissViolationDialog },
                    { text: 'Yes', primary: true, action: onDismissViolationSave }
                ],
            });

            $("#delete").show();

            dialog.data("kendoDialog").open();
        }
        else {
            //Kendo error alert -- No Action message as there is no selection
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.setOptions({
                autoHideAfter: 1500
            });
            popupNotification.show(
                { message: "No Violation is selected for dismiss." },
                "warning"
            );
        }

    });

    $("#newCriminalSettlementViolations").on("click", "a.remove", function () {
        var $tr = $(this).closest("tr"),
            grid = $("#newCriminalSettlementViolations").data("kendoGrid");

        grid.removeRow($tr);
        grid.refresh();
    });

    $("#newAdminSettlementViolations").on("click", "a.remove", function () {
        var $tr = $(this).closest("tr"),
            grid = $("#newAdminSettlementViolations").data("kendoGrid");

        grid.removeRow($tr);
        grid.refresh();
    });

    $("#dis_ddlCaseStatus").change(function () {
        // 
        var docName = $("#dis_ddlCaseStatus option:selected").text();
        if ((docName == 'Forwarded to Supervisor for Review') || (docName == "Returned for Corrections/Investigation")) {
            $("#divCaseSupervisor").removeClass('hidden');
            $("#dis_ddlCaseSupervisor").val("-1");
            $("#btnGenerateLetter").addClass('hidden');
            if (docName == 'Forwarded to Supervisor for Review') {
                $('#lblCaseSupervisor').text('Forward to');
            }
            else if (docName == 'Returned for Corrections/Investigation') {
                $('#lblCaseSupervisor').text('Return to');
            }
            var encodedParam = encodeURIComponent(docName);
            // Now use encodedParam in your AJAX request.

            $.ajax({
                url: '/Enforcement/GetPrivateUsersByFinalAction',
                type: 'POST',
                data: { finalAction: encodedParam },
                success: function (data) {
                    // Handle success
                    // alert("Success");
                    if (data != null) {
                        $("#dis_ddlCaseSupervisor option").remove();
                        $.each(data, function () {
                            $("#dis_ddlCaseSupervisor").append("<option value=" + this.Id + ">" + this.Value + "</option>");
                        });
                    }
                },
                error: function (error) {
                    // Handle error
                    var popupNotification = $("#Notification").data("kendoNotification");
                    popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
                }
            });
            $("#divCaseAssociations").addClass('hidden');
        }
        else if (docName == 'Returned to Division from Legal') { 
            $.ajax({
                url: '/Enforcement/GetAllPrivateUsers',
                type: 'POST',
                success: function (data) {
                    if (data != null) {
                        $("#ddlReturnToDivisionFromLegal option").remove();
                        $.each(data, function () {
                            $("#ddlReturnToDivisionFromLegal").append("<option value=" + this.Id + ">" + this.Value + "</option>");
                        });

                        $("#divReturnToDivisionFromLegal").removeClass('hidden');
                    }
                },
                error: function (error) {
                    // Handle error
                    var popupNotification = $("#Notification").data("kendoNotification");
                    popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
                }
            });
        }
        //else if (docName == 'Summary Suspension Order - Breach') {--EGIS 1370
        //    $("#btnGenerateLetter").removeClass('hidden');
        //    $("#dvNoteAndAction").addClass('hidden');
        //    $("#divUploadLetter").removeClass('hidden');
        //    $("#divCaseSupervisor").addClass('hidden');
        //}   
        else if (docName == 'Case Combined') {
            $("#divCaseAssociations").removeClass('hidden');

        }
        else {
            $("#divUploadLetter").addClass('hidden');
            $("#btnGenerateLetter").addClass('hidden');
            $("#dvNoteAndAction").removeClass('hidden');
            $("#divCaseSupervisor").addClass('hidden');
            $("#divCaseAssociations").addClass('hidden');
            $("#divReturnToDivisionFromLegal").addClass('hidden');
            $("#err_returnToDivisionFromLegal").addClass('hidden');
        }
    });
    $("#dis_ddlLegalCaseStatus").change(function () {
        var statusText = $("#dis_ddlLegalCaseStatus option:selected").text();
        if (statusText == 'Other') {
            $("#dvOtherStatus").removeClass('hidden');
        }
        else {
            $("#dvOtherStatus").addClass('hidden');
        }

        if (statusText == 'Case Combined') {
            $("#divLegal_PrentCases").removeClass('hidden');
        }
        else {
            $("#divLegal_PrentCases").addClass('hidden');
        }

    //EGIS - 1491
    if (statusText == 'Return to Division') {
        $.ajax({
            url: '/Enforcement/GetPrivateUsersByLegalItem',
            type: 'POST',
            data: { sourceRecordType: sourceRecordType },
            success: function (data) {
                if (data != null) {
                    $("#ddlReturnToDivision option").remove();
                    $.each(data, function () {
                        $("#ddlReturnToDivision").append("<option value=" + this.Id + ">" + this.Value + "</option>");
                    });

                    $("#divReturnToDivision").removeClass('hidden');
                }
            },
            error: function (error) {
                // Handle error
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
            }
        });
    }
    else {
        $("#divReturnToDivision").addClass('hidden');
    }
});
    //$("#dis_penaltyResponseDueDate").kendoDatePicker({
    //    change: SettlementDueDatesValidation
    //});

    //$("#dis_SuspensionStartDate").kendoDatePicker({
    //    change: SettlementDueDatesValidation
    //});

    //$("#dis_educationResponseDueDate").kendoDatePicker({
    //    change: SettlementDueDatesValidation
    //});
});

function closeDialog() {
    $('#confirmationBox').hide();
    $('#confirmationBox').data("kendoDialog").close();
}


const customFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    currencySign: "accounting",
});


function RenderPartialView(e, ishaveRolePermission = false) {
    var id = (e.srcElement.innerText).trim();
    RenderMenuPartialView(id);

    if ($('#hdnLegalCaseStatus').val() != 'undefined' && ($('#hdnLegalCaseStatus').val() == 'Case Closed' || $('#hdnLegalCaseStatus').val() == 'Case Combined') || $('#hdnLegalCaseStatus').val() == 'Case Dismissed') {
        hideLegalCaseActions();
    }
    else {
        $("#dis_ddlLegalCaseStatus option:contains('Reopen Case')").remove();

    }
}

function RenderSettlementPartialView(menuName) {
    RenderMenuPartialView(menuName)
}
function previewLicenseApplicationStatus(WorkItemID, LicenseID, ReferenceLabelName) {
    ShowLoader();
    $.ajax({
        type: "POST",
        url: "/Enforcement/GetLicenseApplicationStatus",
        data: { "WorkItemID": WorkItemID, "LicenseID": LicenseID },
        success: function (data) {

            if (data != null) {
                // hideAllPartialViews('licenseApplicationStatusPartialView');
                document.getElementById('dvLicenseApplictaionStatus').classList.remove('hidden');
                $("#licenseApplicationStatusPartialView").html(data);
                $("#licenseApplicationStatusGrid").empty();
                $("#licenseApplicationStatusGrid").kendoGrid({
                    toolbar: ["excel"],
                    excel: {
                        fileName: "LicenseApplicationStatus.xlsx",
                        allPages: true,
                    },
                    dataSource: {
                        data: data,
                        schema: {
                            model: {
                                fields: {
                                    LicenseID: { type: "number" },
                                    ApplicationID: { type: "number" },
                                    Status: { type: "string" },
                                    CreatedDate: { type: "string" },
                                    CreatedBy: { type: "string" },

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
                        { field: "LicenseID", title: "LicenseID" },
                        { field: "ApplicationID", title: "ApplicationID" },
                        { field: "Status", title: "Status" },
                        { field: "CreatedDate", title: "CreatedDate" },
                        { field: "CreatedBy", title: "CreatedBy", width: 200 },

                    ]
                });
            }

        }
    });



}

function RenderMenuPartialView(id) {
    HideLegalActionDivs();
    if ($('#divNoRecordFoundMessage').length) {
        $('#divNoRecordFoundMessage').hide();
    }
    hideAllPartialViews('dvLicenseApplictaionStatus');

    var licenseID = $("#hdnApplicationId").val();
    var workItemType = $("#hdnWorkItemTypeID").val();
    var workItemID = $("#hdnWorkItemID").val();
    var workItemTypeId = $("#hdnWorkItemTypeIDs").val();
    parameters = { "WorkitemTypeID": workItemType, "WorkitemID": workItemID }
    document.getElementById('viewDispositionData_ReadOnly').classList.add('hidden');
    const viewDispositionData_ReadOnly = document.getElementById('viewDispositionData_ReadOnly');
    viewDispositionData_ReadOnly.style.display = '';
    document.getElementById('dvLicenseApplictaionStatus').classList.add('hidden');
    if (id == "Overview" && workItemType != "LEG") {
        previewInvCaseOverviewInformation_ReadOnly();
    }
    else if (workItemType == 'LEG' && id == "Correspondence") {
        previewCorrespondence();
    }
    else if (workItemType == 'LEG' && id == "Legal Status") {
        previewLegalCaseStatus(caseId);
    }
    else if (id == "Overview" && workItemType == "LEG") {
        $('#legalReadOnlyDetails').show();
        $('#divUpdateSOAHNumber').hide();
        previewLegalInvCaseOverviewInformation_ReadOnly();
        HideLegalActionDivs();
    }
    else if (id == "Violations") {

        hideAllPartialViews('viewDispositionData');

        previewCaseViolations();
        if (document.getElementById('violations_add')) {
            document.getElementById('violations_add').classList.add('hidden');
        }
    }
    else if (id == "Action") {
        previewCaseAction(caseId);
    }
    else if (id == "Case Status") {
        previewCaseStatus(caseId);
    }
    else if (id == "Legal Notices") {
        //previewLegalCaseNotices(caseId, workItemTypeId);
        $("#viewLegalDispositionRecommendationID").html(caseId);
        hideAllPartialViews('divCreateLegalNoticeDocument');
        $('#lblLegalID').show();
        $('#lblSettlementID').hide();
    }
    else if (id == "Penalties") {
        previewPenalty();
    }
    else if (id == "Court / Attachment") {
        hideAllPartialViews('viewDispositionCourtAttachment');
        previewDispositionCourtAttachment();
    }
    else if (id == "Notes") {
        previewCaseNotes(caseId);
    }
    else if (id == "History") {
        // previewEventActionHistory(caseId, workItemTypeId, "Case ID");
        previewEventActionHistory(workItemID, workItemTypeId, "Case ID"); //Note Workflow history should be display here
    }
    else if (id == "License/Application Status") {

        // previewEventActionHistory(caseId, workItemTypeId, "Case ID");
        previewLicenseApplicationStatus(workItemID, licenseID, "Case ID"); //Note Workflow history should be display here
    }
    else if (id == "Narrative") {
        previewCaseNarrative(caseId);
    }
    else if (id == "Documents") {
        previewCaseDocuments(caseId, workItemType, workItemID);
    }
    else if (id == "Research Report") {
        ShowLoader();

        var workitemID = $("#hdnWorkItemID").val();
        var WorkItemType = $("#hdnWorkItemTypeID").val();
        var caseID = 0;
        var investigationID = 0;
        /*if (subjectType == 'License') {*/
        if (WorkItemType === "LEG" && $('#hdnSubjectType').val() === "License") {
            subjectId = $('#hdnSubjectId').val();
            caseID = $("#hdnLegalcaseId").val();
            investigationID = $("#hdnLegalInvestigationId").val();
        }


        var hdnWorkItemTypeIDs = $("#hdnWorkItemTypeIDs").val();
        var hdnWorkItemTypeID = $("#hdnWorkItemTypeID").val();
        var hdnLegalcaseId = $('#hdnLegalcaseId').val();

        GenerateLicenseReport(subjectId, workitemID, investigationID, hdnWorkItemTypeIDs, WorkItemType, hdnLegalcaseId);

        //$.ajax({
        //    type: "GET",
        //    url: "/Process/GetPermitteeResearchReportData?WorkItemID=" + workitemID + "&WorkitemTypeID=" + $("#hdnWorkItemTypeIDs").val() + "&LicenseID=" + subjectId + "&WorkItemType=" + $("#hdnWorkItemTypeID").val() + "&CaseID=" + $('#hdnLegalcaseId').val() +"&InvestigationID=" + investigationID,
        //    // dataType: "json",
        //    success: function (results) {
        //        ShowLoader();
        //        // alert('success');
        //        //LoadBasicInformation(subjectId);
        //        // LoadPrincipalPersonalInfo(results.PersonOrBusinessID);
        //        hideAllPartialViews('permitteeResearchReportPartialView');
        //        $("#permitteeResearchReportPartialView").html(results);
        //        if ((WorkItemType === "LEG" || WorkItemType === "CAS" ) && $('#hdnSubjectType').val() === "License") {
        //            document.getElementById("rptLegalCaseType").innerHTML = $('#hdnLegalCaseType').val();
        //            document.getElementById("rptLegalAdminNoticeNumber").innerHTML = $('#hdnLegalAdminNoticeNumber').val();
        //            document.getElementById("rptLegalCaseId").innerHTML = $('#hdnLegalcaseId').val();
        //            document.getElementById("rptLegalJuvenileJustice").innerHTML = $('#hdnLegalJuvenileJustice').val();
        //            document.getElementById("rptLegalClassified").innerHTML = $('#hdnLegalClassified').val();
        //            document.getElementById("rptLegalCaseAdopted").innerHTML = $('#hdnLegalCaseAdopted').val();
        //        }

        //        HideLoader();
        //    },
        //    error: function (xhr) {
        //        // alert('error');
        //    },
        //});

    }
    else if (workItemType == 'CAS' && id == "Field Settlement") {
        previewSettlement();
    }
    else if (workItemType == 'LEG' && id == "Legal Settlement") {
        previewSettlement(true);
    }
    else if (workItemType == 'CAS' && id == "Warnings") {
        previewCaseWarnings();
    }
    else if (workItemType == 'CAS' || workItemType == 'LEG') {
        switch (id) {
            case 'Investigators':
                previewAssociatedInvestigators();
                break;
            case 'Parties': // 'Attorneys':
                previewAssociatedAttorney();
                break;
            case 'Associations':
                hideAllPartialViews('Associations');
                previewInvestigationAssociations();
                break;
            default:
        }
        return;
    }
}



function previewLegalTemplate() {
    $("#viewLegalDispositionRecommendationID").html(caseId);
    var selectedTemplateId = $('#ddlLegalNoticeTemplate').find(":selected").val();
    var templatename = $("#ddlLegalNoticeTemplate option:selected").text();
    $("#spnTemplateName").text(templatename);
    var callUrl = "";
    if ($('#lblSettlementID').is(':visible')) {
        var settlementId = $('#viewLegalSettlementID')[0].innerHTML;
        callUrl = "/Process/GetAsposeTemplateContent?caseId=" + caseId + "&templateId=1&departmentId=3&letterTemplateId=" + selectedTemplateId + "&settlementId=" + settlementId
    } else {
        callUrl = "/Process/GetTemplateContent?caseId=" + caseId + "&templateId=1&departmentId=3&letterTemplateId=" + selectedTemplateId;
    }

    $.ajax({
        type: "GET",
        url: callUrl,
        dataType: "json",
        success: function (data) {
            document.getElementById('divCreateLegalNoticeDocument').classList.add('hidden');
            document.getElementById('divPreviewLegalTemplate').classList.remove('hidden');
            document.getElementById('divTemplateContent').classList.remove('hidden');
            document.getElementById("divTemplateContent").innerHTML = data.Body;
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went wrong. Please try again." }, "error");
        }
    });
}

function backPreviewLegalTemplate() {
    document.getElementById('divPreviewLegalTemplate').classList.add('hidden');
    document.getElementById('divTemplateContent').classList.add('hidden');
    document.getElementById("divTemplateContent").innerHTML = "";
    document.getElementById('divCreateLegalNoticeDocument').classList.remove('hidden');
}

function ExportLetters(isLegal = true) {
    var exportFormat = isLegal == true ? $('#ddl_export').find(":selected").val() : $('#ddl_CMExport').find(":selected").val();
    var templatename = isLegal == true ? $("#ddlLegalNoticeTemplate option:selected").text() : $("#dis_ddlCMTemplateList option:selected").text();

    if (exportFormat != "none") {
        ShowLoader();
        var settlementDoc = new Object();
        settlementDoc.htmlContent = isLegal == true ? document.getElementById("divTemplateContent").innerHTML : document.getElementById("divCMTemplateContent").innerHTML;
        settlementDoc.fileFormat = exportFormat;
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/Process/LetterGenerator', true);
        xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
        xhr.responseType = 'arraybuffer';
        xhr.onload = function (e) {
            if (this.status == 200) {
                var blob = new Blob([this.response], { type: "application/docx" });
                var link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = templatename + getCurrentDateTime() + exportFormat;
                link.click();
                HideLoader();
                if (isLegal == true) {
                    $('#ddl_export').val("none");
                } else {
                    $('#ddl_CMExport').val("none");
                }
            }
            else {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "Error while processing request" }, "error");
            }
        };
        xhr.send(JSON.stringify(settlementDoc));
    }
    else {
        var popupNotification = $("#Notification").data("kendoNotification");
        popupNotification.show({ message: "Please select export format." }, "info");
    }
}

function previewSettlement(isLegal = false, isSendtoSettlement = 0, isedit = false, isSendWaiverAction = false) {
    ShowLoader();
    $.ajax({
        type: "GET",
        url: "/Process/GetViolationsByDispositionRecommendationID?dispositionRecommendationId=" + caseId,
        dataType: "json",
        success: function (data) {
            violations = data;
            $.ajax({
                type: "GET",
                url: "/Process/GetSettlement",
                data: { "caseId": caseId, "caseTypeId": $("#hdnCaseTypeId").val(), "licenseId": licNumber, "isLegal": isLegal, "settlementId": isSendtoSettlement, "isEdit": isedit, "isSendWaiverAction": isSendWaiverAction },
                success: function (data) {

                    if (data != null) {
                        hideAllPartialViews('settlementPartialView');
                        $("#settlementPartialView").html(data);
                        previewSettlementByCaseId(caseId, isLegal);
                        if (isSendtoSettlement != 0)
                            settlementId = isSendtoSettlement;
                        setTimeout(HideLoader, 500);
                        if (isSendWaiverAction === true) {
                            $('#screenTitle').html("Send Waiver Order");
                            $('#btnCreateDisAdminSettlementPenalty').html('Send Waiver Order');
                            $('#IsWaiverOrder').val(true);
                        }
                    }
                    else {
                        var popupNotification = $("#Notification").data("kendoNotification");
                        popupNotification.show({ message: "No record was found." }, "warning");
                    }
                },
                error: function (xhr) {
                    var popupNotification = $("#Notification").data("kendoNotification");
                    popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
                },
            });

        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went wrong. Please try again." }, "error");
        }
    });
}

function previewCorrespondence() {
    var workItemID = $("#hdnWorkItemID").val();
    var workItemTypeId = $("#hdnWorkItemTypeIDs").val();
    var itemId = $("#hdnApplicationId").val();

    $.ajax({
        type: "GET",
        url: "/Process/Correspondences?workitemID=" + workItemID + "&workitemTypeID=" + workItemTypeId + "&itemId=" + itemId,
        success: function (data) {
            hideAllPartialViews('correspondencePartialView');
            $("#correspondencePartialView").html(data);
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went wrong. Please try again." }, "error");
        }
    });
}

function previewPenalty() {
    if (subjectType != null) {
        if (subjectType == 'License') {
            previewDispositionAdminPenalties();
        }
        else if (subjectType == 'Person') {
            previewDispositionCriminalPenalties();
        }
    }
}
function initRequestMenuObject() {
    var obj = new Object();
    obj.ViewInvFromSearch = false;
    obj.ViewInvFromEvidSearch = false;
    obj.OnLoad = false;
    obj.ViewInvFromWorkitem = false;
    obj.InvestigationData = null;
    obj.AssignedToSupervisorId = null
    obj.DisSubjectType = null;
    obj.DispositionView = false;
    obj.ViewFromEvidenceWorkItem = false;

    return obj;
}

function previewInvestigationDataById(investigationID, viewInvFromEvidSearch = false, viewInvFromWorkitem = false) {
    selectedInvestigationId = investigationID;
    //$("#ID").val(investigationID);
    //window.location = "/Enforcement/GetInvestigation?investigationID=" + selectedInvestigationId;
    window.location = "/Enforcement/Dashboard?workitemTypeId=INV&workitemId=" + investigationID;

}
function NavigatetoInvestigation(investigationID, status = true) {
    
    selectedInvestigationId = investigationID;
    //$("#ID").val(investigationID);
    //window.location = "/Enforcement/GetInvestigation?investigationID=" + selectedInvestigationId;
    window.location = "/Enforcement/Dashboard?workitemTypeId=INV&workitemId=" + investigationID;

}

function shareCaseLink() {
    var workItemType = $("#hdnWorkItemTypeID").val();
    var workItemID = $("#hdnWorkItemID").val();

    if (workItemType == "LEG") {
        selectedInvestigationId = caseId;
    }
    else {
        selectedInvestigationId = document.getElementById("viewDispositionRecommendationID").innerHTML;
    }
    var workItemTypeId = document.getElementById("hdnWorkItemTypeID").value;

    $.ajax({
        type: "GET",
        url: "/Enforcement/ShareNavigation?selectedInvestigationId=" + selectedInvestigationId + "&workitemtype=" + workItemTypeId,
        contentType: "application/html",
        dataType: "html",
        success: function (data) {
            $("#shareDetailsPopup").html(data);
            $("#sharemodal").modal('show');
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        },
    });


}
function DoCaseAction() {

    var caseAction = $('#selectCaseActions').find(":selected").val();
    switch (caseAction) {
        case 'none':
            break;
        case 'share':
            shareCaseLink();
            break;
        case 'editCase':
            //$("#selectInvestigationActions").hide();
            previewInvCaseOverviewInformation();
            break;
        case 'viewcaseSummary':
            previewCaseOverview();
            break;

    }
}
function DoCaseAction1() {

    var caseAction = $('#selectCaseActions1').find(":selected").val();
    switch (caseAction) {
        case 'none':
            break;
        case 'share':
            shareCaseLink();
            break;
        case 'editCase':
            //$("#selectInvestigationActions").hide();
            previewInvCaseOverviewInformation();
            break;
        case 'viewcaseSummary':
            previewCaseOverview();
            break;
        case 'addNDO':
            fn_Update_Case_NonDisclosureOrder('add');
            break;
        case 'removeNDO':
            fn_Update_Case_NonDisclosureOrder('remove');
            //fn_Ndo_Confirmation('CAS');
            break;

    }
}

function DoLegalCaseAction() {
    HideLegalActionDivs();
    var caseAction = $('#selectLegalCaseActions1').find(":selected").val();
    switch (caseAction) {
        case 'none':
            break;
        case 'share':
            shareCaseLink();
            break;
        case 'updateSOAH':
            previewLegalSOAH();
            break;
        case 'assignDocket':
            previewassignDocketNumber();
            break;
        case 'updatelegalaction':
            UpdateLegalCaseAction();
            break;
        case 'appointment':
            CaseAppointment();
            break;
        case 'addNDO':
            fn_Update_LegalCase_NonDisclosureOrder('add');
            break;
        case 'removeNDO':
            fn_Update_LegalCase_NonDisclosureOrder('remove');
            //fn_Ndo_Confirmation('CAS');
            break;
        case 'oagnotes':
            CaseOAGNotes();
            break;
        case 'SendDocToLicensee':
            fnSendDocToLicensee();
            break;

    }
}

function UpdateLegalCaseAction(caseAction) {

    ShowHideLegalSection(true);
}


function previewassignDocketNumber() {
    selectedViolationLst = [];
    itemsToSelect = [];
    selectedRows = [];
    isRowSelected = [];

    $('#viewLegalDispositionRecommendationIDActionAssignDoc').html($('#hdnApplicationId').val());
    $('#legalReadOnlyDetails').hide();
    $('#divAssignDocketNumber').show();
    //$('#divCaseAppointment').hide();
    if (document.getElementById('divCaseAppointment')) {
        document.getElementById('divCaseAppointment').classList.add('hidden')
    }

    $.ajax({
        type: "GET",
        url: "/Process/GetViolationsByDispositionRecommendationID?dispositionRecommendationId=" + caseId,
        dataType: "json",
        success: function (result) {
            if (result.length > 0) {
                $("#AssignDocketGridResult").kendoGrid({
                    dataSource: {
                        data: result,
                        schema: {
                            model: {
                                fields: {
                                    ViolationId: { type: "number" },
                                    ViolationSubType: { type: "string" },
                                    ViolationStatus: { type: "string" },
                                    strViolationDate: { type: "string" },
                                    DocketNumber: { type: "number" },
                                }
                            }
                        },
                        pageSize: 20
                    },
                    groupable: false,
                    scrollable: false,
                    sortable: false,
                    pageable:
                    {
                        pageSizes: true,
                        buttonCount: 3
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
                        { selectable: true, width: 30 },
                        { field: "strViolationDate", title: "Date", width: 100 },
                        { field: "ViolationId", title: "Violation", hidden: "true" },
                        { field: "ViolationSubType", title: "Violation", width: 400 },
                        { field: "ViolationStatus", title: "Violation Status", width: 150 },
                        {
                            field: "DocketNumber", title: "Docket Number", width: 80,
                            attributes: {
                                style: "text-align: right;"
                            }
                        },
                    ]
                    , change: function (e, args) {
                        var grid = e.sender;
                        var items = grid.items();
                        items.each(function (idx, row) {
                            var idValue = grid.dataItem(row).get(idField);
                            var checkbox = $(row).find("input[type=checkbox]");
                            var isHidden = checkbox[0].hidden;
                            if (!isHidden) {
                                if (row.className.indexOf("k-state-selected") >= 0) {
                                    isRowSelected[idValue] = true;
                                    SetSelectedRows(idValue, false);
                                } else if (isRowSelected[idValue]) {
                                    delete isRowSelected[idValue];
                                    SetSelectedRows(idValue, true);
                                }
                            }
                        });
                    },
                    dataBound: function (e) {
                        var grid = e.sender;
                        var items = grid.items();
                        items.each(function (idx, row) {

                            var dataItem = grid.dataItem(row);
                            if (isRowSelected[dataItem[idField]]) {
                                var idValue = grid.dataItem(row).get(idField);
                                SetSelectedRows(idValue, true);
                                itemsToSelect.push(row);
                            }
                            if (dataItem.ViolationStatus == 'CA-Violation Dismissed' || dataItem.DocketNumber != null) {
                                var checkbox = $(row).find("input[type=checkbox]");
                                $(checkbox).attr('hidden', true);
                                //$(checkbox).attr('checked', true);
                            }
                        });
                        e.sender.select(itemsToSelect);
                    },
                });
            }
            else {
                $("#btnDismissViolation").hide();
                if ($('#divNoRecordFoundMessage').length) {
                    disPlayNotExistMessage('No violations found on this case.');
                }
                //var popupNotification = $("#Notification").data("kendoNotification");
                //popupNotification.show({ message: "No violations found on this case." }, "warning");
            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went wrong. Please try again." }, "error");
        }
    });
}


function cancelAssignDocketNumber() {
    $('#legalReadOnlyDetails').show();
    $('#divAssignDocketNumber').hide();
    $('#selectLegalCaseActions1').val("none");
}

function assignDocketNumber() {
    if (selectedRows.length > 0) {
        var dialog = $("#delete");
        dialog.kendoDialog({
            width: "500px",
            title: false,
            closable: false,
            modal: true,
            content: ("<div class='text-center'>" +
                "</div>" +
                "<div class='text-center'>" +
                "Are you sure you want to Assign Docket Number?" +
                "</div>"),
            actions: [
                { text: 'Cancel', action: closeAssignDocketNumberDialog },
                { text: 'Yes', primary: true, action: onAssignDocketNumberSave }
            ],
        });

        $("#delete").show();

        dialog.data("kendoDialog").open();
    }
    else {
        //Kendo error alert -- No Action message as there is no selection
        var popupNotification = $("#Notification").data("kendoNotification");
        popupNotification.setOptions({
            autoHideAfter: 1500
        });
        if ($('#divNoRecordFoundMessage').length) {
            disPlayNotExistMessage('No Violation is selected for Docket Number assignment.');
        }
        //popupNotification.show(
        //    { message: "No Violation is selected for Docket Number assignment." },
        //    "warning"
        //);
    }
}
function closeAssignDocketNumberDialog() {
    $('#delete').hide();
    $('#delete').data("kendoDialog").close();
}

function onAssignDocketNumberSave() {
    var workItemID = $("#hdnWorkItemID").val();
    if (selectedRows.length > 0) {
        $.ajax({
            type: "POST",
            url: "/Enforcement/AssignDocketNumberToLegalCase?violationIds=" + JSON.stringify(selectedRows) + "&caseId=" + caseId + "&workItemId=" + workItemID,
            dataType: "json",
            success: function (results) {

                if (results == true) {
                    var popupNotification = $("#Notification").data("kendoNotification");
                    popupNotification.show({ message: "Violation docket number generated successfully." }, "success", 5000);
                    selectedViolationLst = [];
                    itemsToSelect = [];
                    selectedRows = [];
                    isRowSelected = [];
                    $('#legalReadOnlyDetails').show();
                    $('#divAssignDocketNumber').hide();
                    $('#AssignDocketGridResult').empty();
                    previewLegalInvCaseOverviewInformation_ReadOnly();
                }
                else {
                    var popupNotification = $("#Notification").data("kendoNotification");
                    popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
                }
            },
            error: function (xhr) {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
            },
        });

    }
    else {
        var popupNotification = $("#Notification").data("kendoNotification");
        popupNotification.setOptions({
            autoHideAfter: 1500
        });
        popupNotification.show(
            { message: "No violation is selected, please try again." },
            "warning"
        );
    }
}

function previewLegalSOAH() {

    $('#viewLegalDispositionRecommendationIDActionSOAH').html($('#hdnApplicationId').val());
    $('#legalReadOnlyDetails').hide();
    $('#divUpdateSOAHNumber').show();
    //$('#divCaseAppointment').hide();
    if (document.getElementById('divCaseAppointment')) {
        document.getElementById('divCaseAppointment').classList.add('hidden')
    }


}


function cancelSOAHUpdate() {
    $('#legalReadOnlyDetails').show();
    $('#divUpdateSOAHNumber').hide();
}

function updateSOAHDetails() {
    var isError = false;
    var soahNoteInput = $('#txt_SOAHNote').val();
    var soahNumberInput = $('#txt_LegalSOAHNumber').val();
    var workItemID = $("#hdnWorkItemID").val();

    if (soahNumberInput === "") {
        document.getElementById('err_SOAHNumber').classList.remove('hidden');
        isError = true;
    } else {
        if (soahNumberInput.length > 27) {
            document.getElementById('err_SOAHNumbermax').classList.remove('hidden');
            isError = true;
        }



        document.getElementById('err_SOAHNumber').classList.add('hidden')
    }

    if (isError) return;

    var createRequest = new Object();
    createRequest.DispositionRecommendationId = caseId;
    createRequest.SOAHNote = soahNoteInput;
    createRequest.SOAHNumber = soahNumberInput;
    createRequest.WorkItemId = workItemID;

    $.ajax({
        type: "POST",
        url: "/Enforcement/UpdateSOAHDetails",
        contentType: "application/json",
        data: JSON.stringify(createRequest),
        success: function (data) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Request processed successfully." }, "success");
            $('#txt_SOAHNote').val("");
            $('#legalReadOnlyDetails').show();
            $('#divUpdateSOAHNumber').hide();
            previewLegalInvCaseOverviewInformation_ReadOnly();
        },
        error: function (objError) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Error while processing request" }, "error");
        }
    });
}

function ShowHideLegalSection(flag) {
    $('#viewLegalDispositionRecommendationIDAction').html($('#hdnApplicationId').val());
    $('#legal_ActionComment').val("");
    if (flag == true) {
        $('#legalReadOnlyDetails').hide();
        //$('#divUpdateLegalAction').css('display', 'block');
        if (document.getElementById('divUpdateLegalAction')) {
            document.getElementById('divUpdateLegalAction').classList.remove('hidden');
        }

    } else {
        $('#legalReadOnlyDetails').show();
        //$('#divUpdateLegalAction').css('display', 'none')
        if (document.getElementById('divUpdateLegalAction')) {
            document.getElementById('divUpdateLegalAction').classList.add('hidden');
        }
        $('#dis_selectLegalCaseActions').val("-1");
        $('#selectLegalCaseActions1').val("none");
    }
    if (document.getElementById('divCaseAppointment')) {
        document.getElementById('divCaseAppointment').classList.add('hidden');
    }

}

function openFile() {
    document.getElementById("fileUpload").classList.remove("hidden");
}

function hideMenuItem(menuElementName) {
    let menuItems = document.getElementsByName(menuElementName);
    if (menuItems && menuItems.length > 0)
        menuItems[0].classList.add('hidden');
}

function previewInvCaseOverviewInformation_ReadOnly() {

    itemEditMode = false;
    $('#viewDispositionData_ReadOnly').show();
    var workItemType = $("#hdnWorkItemTypeID").val();
    var workItemID = $("#hdnWorkItemID").val();
    var workItemTypeID = $("#hdnWorkItemTypeIDs").val();
    if (workItemType == null || workItemID == null) return;

    if (caseId == 0) return;

    hideAllPartialViews('viewDispositionData_ReadOnly');

    hideAllPartialViews('viewDispositionData');

    $.ajax({
        type: "GET",
        url: "/Enforcement/GetDispositionRecommendationMasterById?dispositionRecommendationId=" + caseId,
        dataType: "json",
        success: function (data1) {
            //  
            if (data1 != null && data1 == "Denied") {
                var popupNotification = $('#Notification').data("kendoNotification");
                popupNotification.show({ message: "You are not authorized to access this Case. Please contact your administrator." }, "error");
                window.location.href = "/Enforcement/Dashboard?workitemTypeId=CAS_Search"; //history.back() ,'/Apps/AdvanceSearch'
                return;
            }
            if (data1 != null) {
                document.getElementById('selectCaseActions1').value = 'none';
                var obj = initRequestMenuObject();
                obj.DisSubjectType = data1.SubjectType;
                obj.ViewInvFromWorkitem = true;
                /* obj.InvestigationData = investigation;*/
                obj.AssignedToSupervisorId = data1.AssignedToSupervisorId;
                obj.DispositionView = true;
                if (data1.AssignedToSupervisorId != data1.EmployeeId) {
                    hideMenuItem('Menu_Penalties');
                    //hideMenuItem('Menu_Court / Attachment');
                }
                //Hide Settlement & legal notice option for unaccepted legal case
                //if (data1.CaseTypeId==1 && data1.FinalAction !== "Accept Case") {
                //    hideMenuItem('Menu_Settlement');
                //    hideMenuItem('Menu_Legal Notice');
                //}
                //if ($("#hdnIsForwardedToLegalCase").val() == 'True') {
                //    document.getElementsByName('Menu_Legal Notice')[0].classList.remove('hidden');
                //}
                //else {
                //    document.getElementsByName('Menu_Legal Notice')[0].classList.add('hidden');
                //}

                /*getMenuList(obj);*/
                document.getElementById('viewDispositionData').classList.add('hidden');
                document.getElementById('viewDispositionData_ReadOnly').classList.remove('hidden');
                document.getElementById('viewDispositionResults').classList.add('hidden');
                /*document.getElementById('divCaseAppointment').classList.add('hidden');*/

                var elements = document.getElementsByName("viewDispositionRecommendationID");
                for (i = 0; i < elements.length; i++) {
                    elements[i].innerHTML = data1.DispositionRecommendationId;
                }
                updateCaseActions(data1.Status);
                document.getElementById("viewDispositionWorkItemID").innerHTML = workItemID;

                document.getElementById("viewDisDateCreated1").innerHTML = data1.DateCreated ? new Date(parseInt(data1.DateCreated.substr(6))).toLocaleDateString('en-US') : "";
                document.getElementById("viewDisStatus1").innerHTML = data1.Status != "" ? data1.Status : 'None';
                if (data1.SourceRecordTypeId == 2) {
                    document.getElementById("viewInvestigationSourceID1").innerHTML = data1.InvestigationId > 0 ? "<a href='#' class='link' onclick='NavigatetoInvestigation(" + data1.InvestigationId + ", true)'>" + "INV-" + data1.CustomInvNumber + "</a>" : 'None';
                }
                else if (data1.SourceRecordTypeId == 24) {
                    document.getElementById("viewInvestigationSourceID1").innerHTML = data1.SourceRecordId > 0 ? "<a href='#' class='link' onclick='previewInspectionDataByIdNewTabFromCase(" + data1.SourceRecordId + ")'>" + "INS-" + data1.SourceRecordId + "</a>" : 'None';
                }
                /* OA-1348: ACT WorkItem Code Reversal
                else if (data1.SourceRecordTypeId == 28) {
                    document.getElementById("viewInvestigationSourceID1").innerHTML = data1.SourceRecordId > 0 ? "<a href='#' class='link' onclick='previewActivityDataByIdNewTabFromCase(" + data1.SourceRecordId + ")'>" + "ACT-" + data1.SourceRecordId + "</a>" : 'None';
                }
                */
                if (data1.InvestigationId > 0) { selectedInvestigationID = data1.InvestigationId; }
                document.getElementById("viewDisInvestigator1").innerHTML = data1.InvestigatingCPO != "" ? data1.InvestigatingCPO : 'None';
                document.getElementById("viewDisSubject1").innerHTML = getSubjectActionUrl(data1);
                document.getElementById("viewDisIsClassified1").innerHTML = data1.IsClassified ? "Classified" : "Unclassified";
                document.getElementById("viewDisIsJuvenile1").innerHTML = data1.IsJuvenileJustice ? "Juvenile" : "Standard";
                document.getElementById("viewDisIsCaseAdopted1").innerHTML = data1.IsCaseAdopted ? "Yes" : "No";
                document.getElementById("viewDisAdminNoticeNumber1").innerHTML = data1.AdminNoticeNumber;
                adminNoticeNumber = data1.AdminNoticeNumber;
                document.getElementById("viewDisCaseTypeNoticeNo").innerHTML = data1.CaseTypeId == 1 ? 'Admin Notice #' : 'Criminal Citation Number';
                // document.getElementById("viewPenaltyID1").innerHTML = data1.PenaltyId > 0 ? data1.PenaltyId : 'None';
                document.getElementById("viewDisClosureNotes1").innerHTML = data1.ClosureNotes != "" ? data1.ClosureNotes : 'None';
                document.getElementById("viewCaseType").innerHTML = data1.CaseType;

                document.getElementById("viewIsRepresentedbyLawyer").innerHTML = (data1.IsReprsentedByLawyer) == true ? 'Yes' : 'No';

                if (data1.IsReprsentedByLawyer == true) {
                    document.getElementById("fileUpload").classList.remove("hidden");
                }
                else {
                    document.getElementById("fileUpload").classList.add("hidden");
                }

                //if (data1.ResFiles) {
                //    document.getElementById("fileName").innerHTML = (data1.ResFiles.length > 0) ? (data1.ResFiles[0].FileName) ? "<a href='/Enforcement/DownloadFile?FileID=" + data1.ResFiles[0].EncriptedFileId + "' target='_blank' class='link')'>" + data1.ResFiles[0].FileName + "</a>" : '' : '';
                //}
                if (data1.ResFiles && data1.ResFiles.length > 0) {
                    fnrRenderFileList(data1.ResFiles, 'viewRepresentedFileList');
                }
                else {
                    var ulElement = document.getElementById('viewRepresentedFileListNone');
                    // Set its text content
                    ulElement.textContent = 'None';
                }
                subjectType = data1.SubjectType;
                //$('#hdnSubjectType').val(subjectType);
                document.getElementById("hdnSubjectType").value = data1.SubjectType;
                subjectId = data1.SubjectId;
                if (data1.LegalCaseStatus != "") {
                    $("#divIsLegalCaseAvailable").removeClass("hidden");
                    document.getElementById("viewLegalAttorney1").innerHTML = data1.AttorneyName != "" ? data1.AttorneyName : 'None';
                    document.getElementById("viewLegalCaseStatus1").innerHTML = data1.LegalCaseStatus != "" ? data1.LegalCaseStatus : 'None';

                    document.getElementById("viewLegalDocketNumber1").innerHTML = data1.PrimaryDocketNumber != "" ? data1.PrimaryDocketNumber : 'None';
                    if (data1.PrimaryDocketNumber == null || data1.PrimaryDocketNumber == '' || data1.PrimaryDocketNumber == undefined) {
                        document.getElementById('primarydocnumber1').classList.add('hidden');
                    }
                    else
                        document.getElementById('primarydocnumber1').classList.remove('hidden');
                }
                else {
                    $("#divIsLegalCaseAvailable").addClass("hidden");
                }
                if (data1.Status && data1.Status == 'Deviate From Penalty Chart') {
                    $("#editCaseOption").addClass("hidden");
                }

                $("#hdnCaseTypeId").val(data1.CaseTypeId);
                $("#AssignedToSupervisorId").val(data1.AssignedToSupervisorId);//EGIS-902

                var elements = document.getElementsByName("viewInvestigationID");
                for (i = 0; i < elements.length; i++) {
                    elements[i].innerHTML = data1.InvestigationId;
                }
                //if (data1.ResFiles && data1.ResFiles.length > 0) {
                //    document.getElementById("fileUpload").classList.add("hidden");
                //    document.getElementById("fileName").classList.remove("hidden");
                //    document.getElementById("change").classList.remove("hidden");
                //}
                //else {
                //    document.getElementById("fileUpload").classList.remove("hidden");
                //    document.getElementById("fileName").classList.remove("hidden");
                //    document.getElementById("change").add("hidden");
                //}

                if (data1.PenaltyId > 0) {
                    if (data1.PenaltyStatus === "Closed") {
                        document.getElementById("btnCancelPenalty").classList.add("hidden");
                    } else {
                        document.getElementById("btnCancelPenalty").classList.remove("hidden");
                    }
                }
                else {
                    document.getElementById("btnCancelPenalty").classList.add("hidden");
                }

                /*if (isExpungementMode()) { fn_get_Case_NonDisclosureOrder(); }*/
                var isExpUser = false;
                if (isExpungementMode()) {
                    isExpUser = true;
                }
                fn_get_Case_NonDisclosureOrder(isExpUser);
                //document.getElementById('viewDispositionData_Readonly').classList.remove('hidden');      
                //  
                if (data1.IsNDO) {
                    isNDOExists = true;
                    showNDO(false);
                    GetNDODetailsById(caseId, 'CAS', 23);
                }
                else {
                    isNDOExists = false;
                    hideNDO();
                }

            }
            else {
                var popupNotification = $('#Notification').data("kendoNotification");
                popupNotification.show({ message: "No record was found." }, "warning");
            }
            previewLegalCaseWorkItemInformation();
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went wrong. Please try again." }, "error");
        }
    });
}

// Function to render the list of attached files
function fnrRenderFileList(files, dynamicId) {
    var fileListElement = $("#" + dynamicId);

    // Clear existing list items
    fileListElement.empty();
    files.forEach(function (file) {
        var listItem = $('<li>');
        var link = $('<a>').text(file.FileName).attr('href', '/Enforcement/DownloadFile?FileID=' + file.EncriptedFileId);
        listItem.append(link);
        fileListElement.append(listItem);
        fileListElement.append('</li>');
    });
}

// Function to render the list of attached files
function fnrRenderFileList(files, dynamicId) {
    var fileListElement = $("#" + dynamicId);

    // Clear existing list items
    fileListElement.empty();
    files.forEach(function (file) {
        var listItem = $('<li>');
        var link = $('<a>').text(file.FileName).attr('href', '/Enforcement/DownloadFile?FileID=' + file.EncriptedFileId);
        listItem.append(link);
        fileListElement.append(listItem);
        fileListElement.append('</li>');
    });
}

function generateEditFilesTemplate_LR(files) {
    var dataElements = "";
    for (var i = 0; i < files.length; i++) {
        var fileUrl = "<a href='/Enforcement/DownloadFile?FileID=" + files[i].EncriptedFileId + "' target='_blank' class='link'>" + files[i].FileName + "</a>"
        var delUrl = "<a title='Delete' class='remove text-danger' id='btnDelete' onclick='deleteFileByFileId(" + files[i].FileId + ")'><i class='ion-ios7-trash-outline'></i></a>"

        dataElements += "<div id='file_" + files[i].FileId + "' class='form-row'>" +
            "<div class='col-md-10'>" + fileUrl + "</div>" +
            "<div class='col-md-2'>" + delUrl + "</div>" +
            "</div>"
    }
    return dataElements;
}

function deleteFileByFileId(fileId) {
    $.ajax({
        type: "GET",
        url: "/Enforcement/DeleteEnforcementFile?fileId=" + fileId + "&type=LetterOfRepresentation",
        dataType: "json",
        success: function (data) {
            if (data != null) {
                lrFilesCount = lrFilesCount - 1;
                document.getElementById("file_" + fileId).classList.add("hidden");
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "Deleted successfully." }, "success");
            }
        },
        error: function (objError) {
            console.log("error");
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went wrong." }, "error");
        }
    });
}


function previewInspectionDataByIdNewTabFromCase(inspectionId, workItemID) {

    var url = '/Enforcement/Dashboard?appId=' + inspectionId + '&workitemId=0' + '&workitemTypeId=' + 'INS' + '#';
    if (url != '')
        window.location = url;
}

/* OA-1348: ACT WorkItem Code Reversal
function previewActivityDataByIdNewTabFromCase(activityId, workItemID) {

    var url = '/Enforcement/Dashboard?appId=' + activityId + '&workitemId=0'+ '&workitemTypeId=' + 'ACT' + '#';
    if (url != '')
        window.location = url;
}
*/

function previewLegalCaseWorkItemInformation() {
    var workItemID = $("#hdnWorkItemID").val();
    var workItemType = $("#hdnWorkItemTypeID").val();
    if (workItemType == null || workItemID == null) return;
    if (caseId == 0) return;

    $.ajax({
        type: "GET",
        url: "/Enforcement/GetWorkItemDetails?workItemId=" + workItemID + "&workItemType=" + workItemType,
        dataType: "json",
        success: function (data1) {
            if (data1 != null) {
                document.getElementById("viewLegalCaseWorkItemId").innerHTML = data1.WorkItemID != "" ? data1.WorkItemID : 'None';
                document.getElementById("viewLegalCaseAssignedTo").innerHTML = data1.AssignedTo != "" ? data1.AssignedTo : 'None';
                document.getElementById("viewLegalCaseWorkItemStatus").innerHTML = data1.WorkItemStatus != "" ? data1.WorkItemStatus : 'None';
                document.getElementById("viewLegalCaseWorkItemCreatedDate").innerHTML = data1.CreatedDate != "" ? data1.CreatedDate : 'None';
                document.getElementById("viewLegalCaseWorkItemCreatedBy").innerHTML = data1.CreatedBy != "" ? data1.CreatedBy : 'None';
                previewDispositionsMatchAssociation(caseId);

            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went wrong. Please try again." }, "error");
        }
    });

}
function previewDispositionsMatchAssociation(CaseID) {


    $.ajax({
        type: "GET",
        url: "/Enforcement/GetAssociationOfDispositionsByCaseID?CaseId=" + CaseID,
        dataType: "json",
        success: function (results) {

            $("#DispositionMatchingAssociationResult").empty();
            if (results.length > 0) {
                document.getElementById('DispositionMatchingAssociation').classList.remove('hidden');

                $("#DispositionMatchingAssociationResult").kendoGrid({
                    toolbar: ["excel"],
                    excel: {
                        fileName: "MatchingAssociationCases.xlsx",
                        allPages: true,
                    },
                    dataSource: {
                        data: results,
                        schema: {
                            model: {
                                fields: {

                                    DispositionRecommendationId: { type: "number" },
                                    Subject: { type: "string" },
                                    SubjectId: { type: "number" },
                                    Status: { type: "string" },
                                    DateCreated: { type: "date" },
                                    CreatedBy: { type: "string" },
                                    WorkitemID: { type: "number" },
                                    WorkitemTypeID: { type: "number" },
                                    AssignedTo: { type: "string" }



                                }
                            }
                        },
                        pageSize: 5
                    },
                    groupable: false,
                    scrollable: true,
                    sortable: true,
                    pageable:
                    {
                        pageSizes: true,
                        buttonCount: 3
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

                        { field: "DispositionRecommendationId", title: "Case ID", width: 80, template: "<a href='\\#' class='link' onclick='previewDispositionDataById(\"#=DispositionRecommendationId#\",\"#=WorkitemID#\",\"#=WorkitemTypeID#\")'>#=DispositionRecommendationId#</a>" },
                        { field: "DispositionType", title: "Case Type", width: 150 },
                        { field: "Subject", title: "Subject", width: 200 },
                        { field: "SubjectId", title: "Subject ID", width: 130 },
                        { field: "Status", title: "Status", width: 90 },
                        { field: "DateCreated", title: "Date Created", width: 130, format: "{0:MM/dd/yyyy}" },
                        { field: "CreatedBy", title: "Created By", width: 150 },
                        { field: "WorkitemID", title: "Workitem ID", width: 130, hidden: "true" },
                        { field: "WorkitemTypeID", title: "Workitem Type ID", width: 130, hidden: "true" },
                        { field: "AssignedTo", title: "Assigned To", width: 130 },
                    ]
                });
            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        },
    });
}
function previewDispositionDataById(dispositionId, WorkitemID, WorkitemTypeID) {
    
    window.location = "/process/InvCaseworkflow?WorkitemID=" + WorkitemID + "&WorkitemTypeID=" + WorkitemTypeID + "&WorkitemType=" + "CAS" + "&ApplicationID=" + dispositionId;

}
function previewLegalInvCaseOverviewInformation_ReadOnly() {

    var workItemType = $("#hdnWorkItemTypeID").val();
    var workItemID = $("#hdnWorkItemID").val();
    if (workItemType == null || workItemID == null) return;
    if (caseId == 0) return;

    hideAllPartialViews('viewLegalDispositionData_ReadOnly');
    // hideAllPartialViews('viewLegalDispositionData');
    $.ajax({
        type: "GET",
        url: "/Enforcement/GetLegalCaseById?workItemId=" + workItemID,
        dataType: "json",
        success: function (data1) {
            var hasAccess = $("#hdnHasAccess").val();
            if (hasAccess == 'False') {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "You are not authorized to access this Case. Please contact your administrator." }, "error");
                window.location.href = "/Enforcement/Dashboard?workitemTypeId=CAS_Search"; //history.back() ,'/Apps/AdvanceSearch'
                return;
            }
            if (data1 != null) {
                document.getElementById('selectLegalCaseActions1').value = 'none';
                if (data1.LegalLicenseDetails.length > 0) {
                    sendDocToLicenseeData = data1.LegalLicenseDetails;
                }
                legalCaseId = (data1.CaseId != "" ? data1.CaseId : 0);
                // document.getElementById('viewLegalDispositionData').classList.add('hidden');
                document.getElementById('viewLegalDispositionData_ReadOnly').classList.remove('hidden');
                // document.getElementById('viewLegalDispositionResults').classList.add('hidden');
                // set the Legal Case Status
                $('#hdnLegalCaseStatus').val(data1.Status);
                if (data1.Status == 'Case Closed' || data1.Status == 'Case Combined' || data1.Status == 'Case Dismissed' || data1.Status == 'Case Combined') {
                    hideLegalCaseActions();
                }
                else {
                    $("#dis_ddlLegalCaseStatus option:contains('Reopen Case')").remove();
                }

                var heading = "Legal Case #" + (data1.CaseId != "" ? data1.CaseId : 'None') + " - Details";
                $("#headingLegalCase").html(heading);
                if (data1.ActionDate != null) {
                    if (new Date(parseInt(data1.ActionDate.substr(6))).toLocaleDateString('en-US') == '1/1/1') {
                        document.getElementById("viewLegalActionDate").innerHTML = "None";
                    }
                    else {
                        document.getElementById("viewLegalActionDate").innerHTML = new Date(parseInt(data1.ActionDate.substr(6))).toLocaleDateString('en-US');
                    }
                }
                document.getElementById("viewLegalSOAHNumber").innerHTML = data1.SOAHNumber != "" ? data1.SOAHNumber : 'None';
                document.getElementById("viewLegalSOAHNote").innerHTML = data1.SOAHNote != "" ? data1.SOAHNote : 'None';
                document.getElementById("txt_LegalSOAHNumber").value = data1.SOAHNumber != "" ? data1.SOAHNumber : '';
                document.getElementById("txt_SOAHNote").value = data1.SOAHNote != "" ? data1.SOAHNote : '';
                document.getElementById("viewLegalDocketNumber").innerHTML = data1.DocketNumber != "" ? data1.DocketNumber : 'None';
                if (data1.DocketNumber == null || data1.DocketNumber == '' || data1.DocketNumber == undefined)
                    document.getElementById('primarydocnumber').classList.add('hidden');
                else
                    document.getElementById('primarydocnumber').classList.remove('hidden');
                document.getElementById("viewLegalCaseStatus").innerHTML = data1.Status != "" ? data1.Status : 'None';
                document.getElementById("viewLegalAction").innerHTML = data1.LastAction != "" ? data1.LastAction : 'None';
                document.getElementById("viewLegalSubject").innerHTML = data1.Subject != "" ? data1.Subject : 'None';
                document.getElementById("viewLegalAttorney").innerHTML = data1.AttorneyName != "" ? data1.AttorneyName : 'None';
                //if (document.getElementById("viewLegalCaseType"))
                //    document.getElementById("viewLegalCaseType").innerHTML = data1?.CaseType != "" ? data1?.CaseType : 'None';
                //if (document.getElementById("viewLegalAdminNoticeNumber"))
                //    document.getElementById("viewLegalAdminNoticeNumber").innerHTML = data1.AdminNoticeNumber != "" ? data1.AdminNoticeNumber : 'None';

                //document.getElementById("viewLegalCaseId").innerHTML = data1.CaseId != "" ? data1.CaseId : 'None';
                //document.getElementById("viewLegalJuvenileJustice").innerHTML = data1.JuvenileJustice != "" ? data1.JuvenileJustice : 'None';
                //document.getElementById("viewLegalClassified").innerHTML = data1.Classified != "" ? data1.Classified : 'None';
                //document.getElementById("viewLegalCaseAdopted").innerHTML = data1.CaseAdopted != "" ? data1.CaseAdopted : 'None';




                $('#hdnSubjectType').val(data1.SubjectType);
                $('#hdnSubjectId').val(data1.SubjectId);
                $('#hdnLegalcaseId').val(data1.CaseId);

                $('#hdnLegalCaseType').val(data1.CaseType != "" ? data1.CaseType : 'None');
                $('#hdnLegalAdminNoticeNumber').val(data1.AdminNoticeNumber != "" ? data1.AdminNoticeNumber : 'None');
                $('#hdnLegalJuvenileJustice').val(data1.JuvenileJustice != "" ? data1.JuvenileJustice : 'None');
                $('#hdnLegalClassified').val(data1.Classified != "" ? data1.Classified : 'None');
                $('#hdnLegalCaseAdopted').val(data1.CaseAdopted != "" ? data1.CaseAdopted : 'None');
                $('#hdnLegalInvestigationId').val(data1.InvestigationID);
                $('#hdnCaseTypeId').val(data1.CaseTypeID)
                subjectType = data1.SubjectType;

                if (data1.Attornies.length > 0) {
                    $("#dvOpposingCounsel").show()
                    $("#dvOpposingCounselResult").kendoGrid({
                        dataSource: {
                            data: data1.Attornies,
                            schema: {
                                model: {
                                    fields: {
                                        FullName: { type: "string" },
                                        Email: { type: "string" },
                                        Phone: { type: "string" },
                                    }
                                }
                            },
                            pageSize: data1.Attornies.length
                        },
                        scrollable: false,
                        columns: [
                            { field: "FullName", title: "Attorney Name", width: 200 },
                            { field: "Email", title: "Attorney Email", width: 200 },
                            { field: "Phone", title: "Attorney Phone", width: 200 },
                        ]
                        ,
                    });
                }
                else {
                    $("#dvOpposingCounsel").hide()
                }
                if (data1.Violations.length > 0) {
                    $("#dvViolations").show();
                    $("#dvViolationsResult").kendoGrid({
                        //toolbar: ["excel"],
                        //excel: {
                        //    fileName: "LegalCaseViolation.xlsx",
                        //    allPages: true
                        //},
                        dataSource: {
                            data: data1.Violations,
                            schema: {
                                model: {
                                    fields: {
                                        AdminNoticeNumber: { type: "string" },
                                        DocketNumber: { type: "string" },
                                        ViolationSubType: { type: "string" },
                                        ViolationStatus: { type: "string" },
                                        strViolationDate: { type: "string" },
                                        CreatedBy: { type: "string" },
                                    }
                                }
                            },
                            pageSize: data1.Violations.length
                        },
                        scrollable: false,
                        //groupable: false,
                        //scrollable: true,
                        //sortable: true,
                        //pageable:
                        //{
                        //    pageSizes: true,
                        //    buttonCount: 3
                        //},
                        //filterable: {
                        //    extra: false,
                        //    operators: {
                        //        string: {
                        //            startswith: "Starts with",
                        //            eq: "Is equal to",
                        //            neq: "Is not equal to"
                        //        }
                        //    }
                        //},
                        columns: [
                            { field: "AdminNoticeNumber", title: "Admin Notice Number", width: 280, template: "#= AdminNoticeNumber != null && AdminNoticeNumber !== undefined && AdminNoticeNumber !== '' ? AdminNoticeNumber : 'N/A' #" },
                            { field: "DocketNumber", title: "Docket Number", width: 280, template: "#= DocketNumber != null && DocketNumber !== undefined && DocketNumber !== '' ? DocketNumber : 'N/A' #" },
                            { field: "ViolationSubType", title: "Violation", width: 280, template: "#= ViolationSubType != null && ViolationSubType !== undefined  && ViolationSubType !== '' ? ViolationSubType : 'N/A' #" },
                            { field: "ViolationStatus", title: "Violation Status", width: 180, template: "#= ViolationStatus != null && ViolationStatus !== undefined  && ViolationStatus !== '' ? ViolationStatus : 'N/A' #" },
                            { field: "strViolationDate", title: "Violation Date", width: 100, template: "#= strViolationDate != null && strViolationDate !== undefined  && strViolationDate !== '' ? strViolationDate : 'N/A' #" },
                            { field: "CreatedBy", title: "Added by", width: 130, template: "#= CreatedBy != null && CreatedBy !== undefined  && CreatedBy !== '' ? CreatedBy : 'N/A' #" },
                            /*           { field: "ViolationId", title: "Violation", width: 160, hidden: "true" },*/


                            /*  { field: "Notes", title: "Notes", width: 200 },*/


                        ]
                        ,
                    });
                }
                else {
                    $("#dvViolations").hide();
                }


                if (data1.LegalLicenseDetails.length > 0) {
                    $("#dvPermitAttached").show();
                    $("#dvPermitAttachedResult").kendoGrid({
                        //toolbar: ["excel"],
                        //excel: {
                        //    fileName: "LegalCasePermitAttached.xlsx",
                        //    allPages: true
                        //},
                        dataSource: {
                            data: data1.LegalLicenseDetails,
                            schema: {
                                model: {
                                    fields: {
                                        LicenseId: { type: "number" },
                                        TradeName: { type: "string" },
                                        LicenseType: { type: "string" },
                                        LicenseStatus: { type: "string" },
                                        LocationAddress: { type: "string" },
                                        LegacyLicenseNumber: { type: "string" },
                                        SubordinateLicenses: { type: "string" },
                                        PhoneNumber: { type: "string" },
                                        ExpirationDate: { type: "string" },
                                    }
                                }
                            },
                            pageSize: data1.LegalLicenseDetails.length
                        },
                        scrollable: false,
                        //groupable: false,
                        //scrollable: true,
                        //sortable: true,
                        //pageable:
                        //{
                        //    pageSizes: true,
                        //    buttonCount: 3
                        //},
                        //filterable: {
                        //    extra: false,
                        //    operators: {
                        //        string: {
                        //            startswith: "Starts with",
                        //            eq: "Is equal to",
                        //            neq: "Is not equal to"
                        //        }
                        //    }
                        //},
                        columns: [
                            {
                                field: "LicenseId", title: "LicenseId", width: 50, template: function (data1) {
                                    return "<a href='#' class='link' onclick = 'viewLicenseInformation(" + data1.LicenseId + ")'>" + data1.LicenseId + "</a>";
                                }
                            },
                            { field: "TradeName", title: "Trade Name", width: 50, template: "#= TradeName != null && TradeName !== undefined && TradeName !== '' ? TradeName : 'N/A' #" },
                            { field: "LicenseType", title: "License Type", width: 100, template: "#= LicenseType != null && LicenseType !== undefined && LicenseType !== '' ? LicenseType : 'N/A' #" },
                            { field: "LicenseStatus", title: "License Status", width: 50, template: "#= LicenseStatus != null && LicenseStatus !== undefined && LicenseStatus !== '' ? LicenseStatus : 'N/A' #" },
                            { field: "LocationAddress", title: "Location Address", width: 100, template: "#= LocationAddress != null && LocationAddress !== undefined && LocationAddress !== '' ? LocationAddress : 'N/A' #" },
                            { field: "LegacyLicenseNumber", title: "Legacy License Number", width: 100, template: "#= LegacyLicenseNumber != null && LegacyLicenseNumber !== undefined && LegacyLicenseNumber !== '' ? LegacyLicenseNumber : 'N/A' #" },
                            { field: "SubordinateLicenses", title: "Subordinate License(s)", width: 100, template: "#= SubordinateLicenses != null && SubordinateLicenses !== undefined && SubordinateLicenses !== '' ? SubordinateLicenses : 'N/A' #" },
                            { field: "PhoneNumber", title: "Phone Number", width: 100, template: "#= PhoneNumber != null && PhoneNumber !== undefined && PhoneNumber !== '' ? PhoneNumber : 'N/A' #" },
                            { field: "ExpirationDate", title: "Expiration Date", width: 100, template: "#= ExpirationDate != null && ExpirationDate !== undefined && ExpirationDate !== '' ? ExpirationDate : 'N/A' #" },
                        ]
                        ,
                    });
                }
                else {
                    $("#dvPermitAttached").hide();
                }

                if (data1.Appointments.length > 0) {
                    $("#dvCaseAppointment").show();
                    //data1.Appointments.forEach((item, index) => {
                    //    item.Appointments = htmlDecode(item.Comment);
                    //});

                    //let rowHTML = '<div class="col-12">';
                    //rowHTML += getDataElementCaseViewSummaryReportPageBreakAvoid('start');
                    //rowHTML += getDataElementCaseViewSummaryReportTable('start');
                    //data1.Appointments.forEach((item, index) => {
                    //    rowHTML += getDataElementCaseViewSummaryReportTR('Appointment Type', item.AppointmentType, undefined, 15);
                    //    rowHTML += getDataElementCaseViewSummaryReportTR('Appointment Date', item.strAppointmentDate, undefined, 15);
                    //    rowHTML += getDataElementCaseViewSummaryReportTR('Comment', item.Comment, 2, 15);
                    //    rowHTML += getDataElementCaseViewSummaryReportTR('', '<hr>', 2, 15);
                    //});
                    //rowHTML += getDataElementCaseViewSummaryReportTable('end');
                    //$("#dvAppointmentResult").html(rowHTML);
                    $("#dvAppointmentResult").kendoGrid({
                        dataSource: {
                            data: data1.Appointments,
                            schema: {
                                model: {
                                    fields: {
                                        AppointmentId: { type: "number" },
                                        AppointmentType: { type: "string" },
                                        AppointmentTypeId: { type: "number" },
                                        strAppointmentDate: { type: "string" },
                                        Comment: { type: "string" }
                                    }
                                }
                            },
                            pageSize: data1.Appointments.length
                        },
                        scrollable: false,
                        //groupable: false,
                        //scrollable: true,
                        //sortable: true,
                        //pageable:
                        //{
                        //    pageSizes: true,
                        //    buttonCount: 3
                        //},
                        //filterable: {
                        //    extra: false,
                        //    operators: {
                        //        string: {
                        //            startswith: "Starts with",
                        //            eq: "Is equal to",
                        //            neq: "Is not equal to"
                        //        }
                        //    }
                        //},
                        columns: [
                            { field: "AppointmentId", title: "Milestone Id", width: 200, hidden: true },
                            { field: "AppointmentTypeId", title: "MilestoneTypeId", width: 200, hidden: true },
                            { field: "AppointmentDate", title: "Milestone Date", width: 200, hidden: true },
                            { field: "AppointmentType", title: "Milestone Type", width: 200 },
                            { field: "strAppointmentDate", title: "Milestone Date", width: 200 },
                            { field: "Comment", title: "Comment", width: 200, encoded: false, template: "<div style='white-space:normal;word-break: break-all;'>#= stripHtmlTags(Comment) #</div>" }
                        ]
                        ,
                    });
                }
                else {
                    $("#dvCaseAppointment").hide();
                }

                if (data1.Correspondences.length > 0) {
                    data1.Correspondences.forEach((item, index) => {
                        item.Notes = htmlDecode(item.Description);
                    });

                    let rowHTML = '<div class="col-12">';
                    rowHTML += getDataElementCaseViewSummaryReportPageBreakAvoid('start');
                    rowHTML += getDataElementCaseViewSummaryReportTable('start');
                    data1.Correspondences.forEach((item, index) => {
                        rowHTML += getDataElementCaseViewSummaryReportTR('Reason', item.Reason, undefined, 15);
                        rowHTML += getDataElementCaseViewSummaryReportTR('Date Sent', item.strDateSent, undefined, 15);
                        rowHTML += getDataElementCaseViewSummaryReportTR('Description', item.Description, 2, 15);
                        rowHTML += getDataElementCaseViewSummaryReportTR('', '<hr>', 2, 15);
                    });
                    rowHTML += getDataElementCaseViewSummaryReportTable('end');
                    $("#dvCorrespondenceResult").html(rowHTML);

                }
                else {
                    $("#dvCaseCorrespondence").hide();
                }

                //if (data1.OAGInformation.length > 0) {
                //    $("#dvOAGNotesResult").kendoGrid({
                //        dataSource: {
                //            data: data1.OAGInformation,
                //            schema: {
                //                model: {
                //                    fields: {
                //                        OAGNoteID: { type: "number" },
                //                        OAGTitle: { type: "string" },
                //                        CreatedBy: { type: "string" },
                //                        strDateCreated: { type: "string" },
                //                        OAGComments: { type: "string" }
                //                    }
                //                }
                //            },
                //            pageSize: data1.OAGInformation.length
                //        },
                //        scrollable: false,
                //        columns: [
                //            { field: "OAGNoteID", title: "Note Id", width: 200, hidden: true },
                //            { field: "OAGTitle", title: "Title", width: 200 },
                //            { field: "CreatedBy", title: "Added by", width: 200},
                //            { field: "strDateCreated", title: "Date", width: 200 },
                //            { field: "OAGComments", title: "Comments", width: 200, encoded: false, template: "<div style='white-space:normal;word-break: break-all;'>#= stripHtmlTags(OAGComments) #</div>" }
                //        ]
                //        ,
                //    });
                //}
                //else {
                //    $("#dvLegalOAGNotes").hide();
                //}

                if (data1.Notes.length > 0) {
                    $("#dvLegalCaseNoteResult").kendoGrid({
                        dataSource: {
                            data: data1.Notes,
                            schema: {
                                model: {
                                    fields: {
                                        FileName: { type: "string" },
                                        NoteType: { type: "string" },
                                        CreatedBy: { type: "string" },
                                        strDateCreated: { type: "string" },
                                        Notes: { type: "string" },
                                    }
                                }
                            },
                            pageSize: data1.Notes.length
                        },
                        scrollable: false,
                        columns: [
                            { field: "FileName", title: "File Name", width: 200, template: "#= FileName != null && FileName !== undefined && FileName !== '' ? FileName : 'N/A' #" },
                            { field: "NoteType", title: "Note Type", width: 200, template: "#= NoteType != null && NoteType !== undefined && NoteType !== '' ? NoteType : 'N/A' #" },
                            {
                                field: "Notes", title: "Notes", width: 200, template: "#= Notes != null && Notes !== undefined && Notes !== '' ? stripHtmlTags(Notes) : 'N/A' #"
                            },
                            { field: "CreatedBy", title: "Added by", width: 200, template: "#= CreatedBy != null && CreatedBy !== undefined && CreatedBy !== '' ? CreatedBy : 'N/A' #" },
                            { field: "strDateCreated", title: "Date", width: 200, format: "{0:g}" },

                            //{
                            //    field: "Notes", title: "Notes", width: 200, template: "<div style='white-space:normal;word-break: break-all;'>#= stripHtmlTags(Notes) #</div>"
                            //},



                        ],

                    });
                }
                else {
                    $("#dvLegalCaseNote").hide();
                }

                if (data1.WorkflowDocuments.length > 0) {
                    $("#dvLegalCaseDocumentResult").kendoGrid({
                        dataSource: {
                            data: data1.WorkflowDocuments,
                            schema: {
                                model: {
                                    fields: {
                                        FileName: { type: "string" },
                                        FolderName: { type: "string" },
                                        DocumentType: { type: "string" },
                                        DocumentNote: { type: "string" },
                                        CreatedBy: { type: "string" },
                                        CreateDate: { type: "date" },
                                    }
                                }
                            },
                            pageSize: data1.WorkflowDocuments.length
                        },
                        scrollable: false,
                        columns: [
                            { field: "FileName", title: "File Name", width: 200 },
                            { field: "FolderName", title: "Folder Name", width: 200, encoded: false },
                            { field: "DocumentNote", title: "Document Note", width: 200 },
                            { field: "CreatedBy", title: "Created By", width: 200 },
                            { field: "CreateDate", title: "Create Date", width: 200, format: "{0:g}" }

                        ],

                    });
                }
                else {
                    $("#dvLegalCaseDocument").hide();
                }

                if (data1.BondInformation.length > 0) {
                    $("#dvBondInformationResult").kendoGrid({
                        dataSource: {
                            data: data1.BondInformation,
                            schema: {
                                model: {
                                    fields: {

                                        FullfilmentType: { type: "string" },
                                        BondAmount: { type: "number" },
                                        BondType: { type: "string" },
                                        BondNumber: { type: "number" },
                                        CreditNumber: { type: "number" },
                                        BondPrimaryStatus: { type: "string" },
                                        //CreateDate: { type: "date" },
                                    }
                                }
                            },
                            pageSize: data1.WorkflowDocuments.length
                        },
                        scrollable: false,
                        columns: [
                            { field: "BondType", title: "Bond Type", width: 200, template: "#= BondType != null && BondType !== undefined ? BondType : 'N/A' #" },
                            { field: "FullfilmentType", title: "Fullfilment Type", width: 200, template: "#= FullfilmentType != null && FullfilmentType !== undefined ? FullfilmentType : 'N/A' #" },
                            { field: "BondAmount", title: "Bond Amount", width: 200, template: "#= BondAmount != null && BondAmount !== undefined ? BondAmount : 'N/A' #" },
                            { field: "BondNumber", title: "Bond Number", width: 200, template: "#= BondNumber != null && BondNumber !== undefined ? BondNumber : 'N/A' #" },
                            { field: "CreditNumber", title: "Credit Number", width: 200, template: "#= CreditNumber != null && CreditNumber !== undefined ? CreditNumber : 'N/A' #" },
                            { field: "BondPrimaryStatus", title: "Status", width: 200, template: "#= BondPrimaryStatus != null && BondPrimaryStatus !== undefined ? BondPrimaryStatus : 'N/A' #" },
                            //{ field: "CreateDate", title: "Create Date", width: 200, format: "{0:g}" }
                        ],

                    });
                }
                else {
                    $("#dvBondInformation").hide();
                }

                //if (data1.Historys.length > 0) {
                //    $("#dvLegalCaseHistoryResult").kendoGrid({
                //        dataSource: {
                //            data: data1.Historys,
                //            schema: {
                //                model: {
                //                    fields: {
                //                        WFWorkItemHistoryID: { type: "number" },
                //                        WorkItemID: { type: "number" },
                //                        WorkItemTypeID: { type: "number" },
                //                        WorkflowActionID: { type: "number" },
                //                        WorkFlowActionType: { type: "string" },
                //                        WorkflowActionNotes: { type: "string" },
                //                        ActionBy: { type: "string" },
                //                        ActionDate: { type: "string" },
                //                    }
                //                }
                //            },
                //            pageSize: data1.Historys.length
                //        },
                //        scrollable: false,
                //        columns: [
                //            { field: "WorkFlowActionType", title: "Action", width: 200 },
                //            //{ field: "WorkflowActionNotes", title: "Notes", width: 200, encoded: false },
                //            { field: "WorkflowActionNotes", title: "Notes", width: 200, template: "<div style='white-space:normal;word-break: break-all;'>#= stripHtmlTags(WorkflowActionNotes) #</div>" },

                //            { field: "ActionBy", title: "Action By", width: 200 },
                //            { field: "ActionDate", title: "Date", width: 200, format: "{0:g}" }
                //        ]
                //    });
                //}
                //else {
                //    $("#dvLegalCaseHistory").hide();
                //}

                if (data1.CourtAttachments.length > 0) {
                    $("#dvCourtAttachmentResult").kendoGrid({
                        dataSource: {
                            data: data1.CourtAttachments,
                            //group: [{ field: "CourtAttachmentId" },  { field: "CourtNumber" }, { field: "CourtNote" }, { field: "DocketNumber" }],
                            schema: {
                                model: {
                                    fields: {
                                        CourtAttachmentId: { type: "number" },
                                        DateFiled: { type: "date" },
                                        CourtNumber: { type: "string" },
                                        CourtNote: { type: "string" },
                                        DocketNumber: { type: "number" },
                                        FileName: { type: "string" },
                                        CreatedDate: { type: "string" },
                                        Notes: { type: "string" },
                                        NoteType: { type: "string" },
                                    }
                                }
                            },
                            //    pageSize: data1.CourtAttachments.length
                        },
                        //scrollable: false,
                        /*groupable: true,*/

                        columns: [
                            { field: "CourtAttachmentId", title: "Court Attachment Id", width: 150, groupHeaderTemplate: "Court Attachment Id: #=value#" },

                            { field: "DateFiled", title: "Date Filed", width: 200, format: "{0:g}" },
                            { field: "CourtNumber", title: "Court Number", width: 150, encoded: false },
                            { field: "DocketNumber", title: "SOAH docket number", width: 200 },
                            {
                                field: "CourtNote", title: "Court Note",
                                template: "<div style='white-space:normal;word-break: break-all;'>#= CourtNote #</div>"
                            },
                            { field: "FileName", title: "Attachments", width: 500 },

                            { field: "NoteType", title: "Type", width: 150 },

                            { field: "CreatedDate", title: "Date", width: 200 },

                            {
                                field: "Notes", title: "Notes",
                                template: "<div style='white-space:normal;word-break: break-all;'>#= Notes #</div>"
                            },

                        ],

                    });
                }
                else {
                    $("#dvCourtAttachment").hide();
                }

                loadReferralCaseDetails(data1.CaseId);

                var isExpUser = false;
                if (isExpungementMode()) {
                    isExpUser = true;
                }
                fn_get_LegalCase_NonDisclosureOrder(isExpUser);
                //document.getElementById('viewDispositionData_Readonly').classList.remove('hidden');      
                //  
                if (data1.IsNDO && data1.CaseId) {
                    isNDOExists = true;
                    showNDO(true);
                    GetNDODetailsById(data1.CaseId, 'LEG', 15);
                }
                else {
                    isNDOExists = false;
                    hideNDO();
                }


            }
            else {
                var popupNotification = $('#Notification').data("kendoNotification");
                popupNotification.show({ message: "No record was found." }, "warning");
            }
            previewLegalCaseWorkItemInformation();
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went wrong. Please try again." }, "error");
        }
    });
}
// Custom function to strip HTML tags
function stripHtmlTags(input) {
    var stripped = $("<div/>").html(input).text();
    return stripped;
}

function previewInvCaseOverviewInformation() {
    itemEditMode = true;
    var workItemType = $("#hdnWorkItemTypeID").val();
    var workItemID = $("#hdnWorkItemID").val();
    var workItemTypeID = $("#hdnWorkItemTypeIDs").val();
    if (workItemType == null || workItemID == null) return;

    if (caseId == 0) return;
    $("#btnUpdateDisposition").html("Update");
    hideAllPartialViews('viewDispositionData');
    hideAllPartialViews('viewDispositionData_Readonly');

    $.ajax({
        type: "GET",
        url: "/Enforcement/GetDispositionRecommendationMasterById?dispositionRecommendationId=" + caseId,
        dataType: "json",
        success: function (data) {
            //  
            if (data != null) {

                var obj = initRequestMenuObject();
                obj.DisSubjectType = data.SubjectType;
                obj.ViewInvFromWorkitem = true;
                /* obj.InvestigationData = investigation;*/
                obj.AssignedToSupervisorId = data.AssignedToSupervisorId;
                obj.DispositionView = true;
                if (data.AssignedToSupervisorId != data.EmployeeId) {
                    hideMenuItem('Menu_Penalties');
                    //hideMenuItem('Menu_Court / Attachment');
                }
                if ($("#hdnIsForwardedToLegalCase").val() == 'True') {
                    if (document.getElementsByName('Menu_Legal Notice')[0] != null) { document.getElementsByName('Menu_Legal Notice')[0].classList.remove('hidden') };
                }
                else {
                    if (document.getElementsByName('Menu_Legal Notice')[0] != null) { document.getElementsByName('Menu_Legal Notice')[0].classList.add('hidden') };
                }
                /*getMenuList(obj);*/

                document.getElementById('viewDispositionData').classList.remove('hidden');
                document.getElementById('viewDispositionData_ReadOnly').classList.remove('hidden');
                document.getElementById('viewDispositionResults').classList.add('hidden');

                var elements = document.getElementsByName("viewDispositionRecommendationID");
                for (i = 0; i < elements.length; i++) {
                    elements[i].innerHTML = data.DispositionRecommendationId;
                }

                document.getElementById("viewDisDateCreated").innerHTML = new Date(parseInt(data.DateCreated.substr(6))).toLocaleDateString('en-US');
                document.getElementById("viewDisStatus").innerHTML = data.Status != "" ? data.Status : 'None';
                document.getElementById("viewDisIsClassified").value = data.IsClassified;

                //document.getElementById("viewInvestigationSourceID").innerHTML =
                //    data.InvestigationId > 0 ? "<a href='#' class='link' onclick='previewInvestigationDataById(" + data.InvestigationId + ", true)'>" + data.CustomInvNumber + "</a>" : 'None';
                if (data.SourceRecordTypeId == 2) {
                    document.getElementById("viewInvestigationSourceID").innerHTML = data.InvestigationId > 0 ? "<a href='#' class='link' onclick='previewInvestigationDataById(" + data.InvestigationId + ", true)'>" + "INV-" + data.CustomInvNumber + "</a>" : 'None';
                }
                else if (data.SourceRecordTypeId == 24) {
                    document.getElementById("viewInvestigationSourceID").innerHTML = data.SourceRecordId > 0 ? "<a href='#' class='link' onclick='previewInspectionDataByIdNewTabFromCase(" + data.SourceRecordId + ")'>" + "INS-" + data.SourceRecordId + "</a>" : 'None';
                    $('#viewDisIsClassified').prop('disabled', true);
                }

                document.getElementById("viewDisInvestigator").innerHTML = data.InvestigatingCPO != "" ? data.InvestigatingCPO : 'None';
                document.getElementById("viewDisSubject").innerHTML = getSubjectActionUrl(data);

                document.getElementById("viewDisIsJuvenile").value = data.IsJuvenileJustice;
                document.getElementById("viewDisIsCaseAdopted").value = data.IsCaseAdopted;
                document.getElementById("isReprsentedByLawyer").value = data.IsReprsentedByLawyer;
                document.getElementById("txt_SOAHNote").value = data.SOAHNumber;
                document.getElementById("viewDisAdminNoticeNumber").innerHTML = data.AdminNoticeNumber;
                document.getElementById("viewPenaltyID").innerHTML = data.PenaltyId > 0 ? data.PenaltyId : 'None';
                document.getElementById("viewDisClosureNotes").innerHTML = data.ClosureNotes != "" ? data.ClosureNotes : 'None';
                document.getElementById('viewDispositionData_ReadOnly').classList.remove('hidden');
                subjectType = data.SubjectType;


                if (data.IsReprsentedByLawyer == true) {
                    document.getElementById("fileUpload").classList.remove("hidden");
                }
                else {
                    document.getElementById("fileUpload").classList.add("hidden");
                }

                var elements = document.getElementsByName("viewInvestigationID");
                for (i = 0; i < elements.length; i++) {
                    elements[i].innerHTML = data.InvestigationId;
                }

                if (data.PenaltyId > 0) {
                    if (data.PenaltyStatus === "Closed") {
                        document.getElementById("btnCancelPenalty").classList.add("hidden");
                    } else {
                        document.getElementById("btnCancelPenalty").classList.remove("hidden");
                    }
                }
                else {
                    document.getElementById("btnCancelPenalty").classList.add("hidden");
                }
                document.getElementById('viewDispositionData_ReadOnly').classList.add('hidden');
                document.getElementById('viewDispositionData').classList.remove('hidden');

                if (data.ResFiles && data.ResFiles.length > 0) {
                    document.getElementById('dis_file_LR_Edit').innerHTML = generateEditFilesTemplate_LR(data.ResFiles);
                    lrFilesCount = data.ResFiles.length;
                }
                else {
                    document.getElementById('dis_file_LR_Edit').innerHTML = '';
                    lrFilesCount = 0;
                }
                //  
                if (data.IsNDO) {
                    isNDOExists = true;
                    showNDO(true);
                    GetNDODetailsById(caseId, 'CAS', 23);
                }
                else {
                    isNDOExists = false;
                    hideNDO();
                }
            }
            else {
                var popupNotification = $('#Notification').data("kendoNotification");
                popupNotification.show({ message: "No record was found." }, "warning");
            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went wrong. Please try again." }, "error");
        }
    });
}

function getSubjectActionUrl(data) {
    if (data.SubjectType == 'License') {
        licNumber = data.SubjectId;
        return "<a href='#' class='link' onclick='previewSubjectLicenseData(" + data.SubjectId + ")'>" + data.Subject + "</a>";
    }
    else if (data.SubjectType == 'Person')
        return "<a href='#' class='link' onclick='previewSubjectPersonData(" + data.SubjectId + ")'>" + data.Subject + "</a>";
    else
        return "None"
}

function hideAllPartialViews(view) {

    if (view == selectedView) return; // to avoid rendering again
    selectedView = view;
    document.getElementById('viewDispositionResults').classList.add('hidden');
    document.getElementById('divCreateLegalNoticeDocument').classList.add('hidden');
    document.getElementById('divPreviewLegalTemplate').classList.add('hidden');
    //document.getElementById('viewLegalDispositionResults').classList.add('hidden');
    document.getElementById('viewDispositionData').classList.add('hidden');
    //document.getElementById('viewLegalDispositionData').classList.add('hidden');
    document.getElementById('viewSubjectData').classList.add('hidden');
    document.getElementById('viewDispositionViolations').classList.add('hidden');
    document.getElementById('viewDispositionAdminPenalties').classList.add('hidden');
    document.getElementById('viewDispositionCriminalPenalties').classList.add('hidden');
    document.getElementById('viewDispositionCourtAttachment').classList.add('hidden');
    document.getElementById('viewCloseDisposition').classList.add('hidden');
    document.getElementById('viewCaseStatus').classList.add('hidden');
    document.getElementById('viewLegalCaseStatusUpdte').classList.add('hidden');
    document.getElementById('viewCaseNotes').classList.add('hidden');
    document.getElementById('viewLegalNoticeResult').classList.add('hidden');
    document.getElementById('searchAssociationPartialView').classList.add('hidden');
    document.getElementById('actionHistoryPartialView').classList.add('hidden');
    document.getElementById('dvLicenseApplictaionStatus').classList.add('hidden');
    //').classList.add('hidden');   

    if (document.getElementById('settlementPartialView'))
        document.getElementById('settlementPartialView').classList.add('hidden');
    document.getElementById('correspondencePartialView').classList.add('hidden');
    if (document.getElementById('permitteeResearchReportPartialView'))
        document.getElementById('permitteeResearchReportPartialView').classList.add('hidden');
    if (document.getElementById('viewCaseNarrative'))
        document.getElementById('viewCaseNarrative').classList.add('hidden');
    if (document.getElementById('viewInvAssociatedInvestigators'))
        document.getElementById('viewInvAssociatedInvestigators').classList.add('hidden');
    if (document.getElementById('investigators_add'))
        document.getElementById('investigators_add').classList.add('hidden');
    if (document.getElementById('caseViewSummaryPartialView'))
        document.getElementById('caseViewSummaryPartialView').classList.add('hidden');
    if (document.getElementById('viewDispositionData_ReadOnly')) {
        document.getElementById('viewDispositionData_ReadOnly').classList.add('hidden');
        const viewDispositionData_ReadOnly = document.getElementById('viewDispositionData_ReadOnly');
        viewDispositionData_ReadOnly.style.display = '';
    }
    if (document.getElementById('viewLegalDispositionData_ReadOnly'))
        document.getElementById('viewLegalDispositionData_ReadOnly').classList.add('hidden');
    if (document.getElementById('CaseDocumentsview'))
        document.getElementById('CaseDocumentsview').classList.add('hidden');

    if (document.getElementById('caseWarningPartialView'))
        document.getElementById('caseWarningPartialView').classList.add('hidden');
    if (document.getElementById('createCaseWarningPartialView'))
        document.getElementById('createCaseWarningPartialView').classList.add('hidden');
    if (document.getElementById('editCaseWarningPartialView'))
        document.getElementById('editCaseWarningPartialView').classList.add('hidden');
    if (document.getElementById('searchCaseWarningPartialView'))
        document.getElementById('searchCaseWarningPartialView').classList.add('hidden');

    if (document.getElementById(view))
        document.getElementById(view).classList.remove('hidden');
    document.getElementById('adminSettlementView').classList.add('hidden');
}

function previewCaseAction(caseId) {
    if (caseId == 0) return;
    hideAllPartialViews('viewCloseDisposition');
}

function previewCaseStatus(caseId) {
    if (caseId == 0) return;
    if (getClosedCaseValue() == 'Yes') {
        var popupNotification = $("#Notification").data("kendoNotification");
        popupNotification.show({ message: "Case is closed." }, "warning");
        return;
    }

    var hdnCaseType = $("#hdnCaseType").val();


    // Your AJAX call
    $.ajax({
        //url: '@Url.Action("PreviewCaseStatus", "Process")',
        url: "/Process/PreviewCaseStatus?ItemID=" + caseId + "&WorkItemType=CAS",
        type: 'GET',
        dataType: 'json',
        success: function (result) {
            hideAllPartialViews('viewCaseStatus');
            // Handle the boolean result
            if (hdnCaseType == 'Criminal Case') {
                return; // 'Forwarded to Legal' status will be handld for Admin Case only.
            }

            if (!result) {
                console.log('Action method returned false');
                // Remove options based on text content
                //$("#dis_ddlCaseStatus option:contains('Forwarded to Legal')").remove();
            }
            else {

                var desiredOptionText = "Forwarded to Legal"; // Text of the option to check and append
                var optionExists = $("#dis_ddlCaseStatus option:contains('" + desiredOptionText + "')").length > 0;

                if (!optionExists) {
                    // Append the option if it doesn't exist
                    $("#dis_ddlCaseStatus").append("<option value='4'>" + desiredOptionText + "</option>");

                    // Exclude the "Select" option from sorting
                    var optionsToSort = $("#dis_ddlCaseStatus option").not(":first");

                    // Sort the options alphabetically
                    var sortedOptions = optionsToSort.sort(function (a, b) {
                        return $(a).text().localeCompare($(b).text());
                    });

                    // Remove all options from the dropdown
                    $("#dis_ddlCaseStatus").empty();

                    // Append the "Select" option and the sorted options to the dropdown
                    $("#dis_ddlCaseStatus").append("<option value='-1'>Select</option>").append(sortedOptions);

                }

            }

        },
        error: function (error) {
            console.error('Error in AJAX request', error);
        }
    });

    /* hideAllPartialViews('viewCaseStatus');*/
}

function previewLegalCaseStatus(caseId) {
    if (caseId == 0) return;
    //if ($('#hdnLegalCaseStatus').val() != 'undefined' && ($('#hdnLegalCaseStatus').val() == 'Case Closed' || $('#hdnLegalCaseStatus').val() == 'Case Combined')) {
    //    var popupNotification = $("#Notification").data("kendoNotification");
    //    popupNotification.show({ message: "Legal Case is closed." }, "warning");
    //    return;
    //}
    hideAllPartialViews('viewLegalCaseStatusUpdte');
    $("#viewLegalDispositionRecommendationID").html(caseId);
}


function previewCaseViolations() {
    hideAllPartialViews('viewDispositionViolations');
    document.getElementById('viewDispositionRecommendationIDViolation').innerHTML = $('#hdnApplicationId').val();
    var workItemId = -1;
    if ($('#hdnWorkItemID').length) {
        workItemId = $("#hdnWorkItemID").val();
        workItemType = $("#hdnWorkItemTypeID").val();
    }

    if (workItemType == 'LEG') {
        /*document.getElementById('viewWorkItemType').html('Legal');*/
        $("#viewWorkItemType").html('Legal ID');
    }
    else {
        /*document.getElementById('viewWorkItemType').html('Case ID');*/
        $("#viewWorkItemType").html('Case ID');
    }

    $.ajax({
        type: "GET",
        url: "/Enforcement/GetDispositionRecommendationMasterById?dispositionRecommendationId=" + caseId + "&workItemId=" + workItemId,
        dataType: "json",
        success: function (data) {
            
            var hideSelectableColumn = false; // Set your condition here
            if ((data.Status == 'Forwarded to Supervisor for Review' && !data.IsAccessible)
                || (data.IsLegalUser && data.Status == 'Forwarded to Legal')) {
                hideSelectableColumn = true;
                //if (document.getElementById('btnDismissViolation')) {
                //    document.getElementById('btnDismissViolation').classList.add('hidden');
                //}
                //if (document.getElementById('addViolation')) {
                //    document.getElementById('addViolation').classList.add('hidden');
                //}
                $('#btnDismissViolation').hide();
                $('#addViolation').hide();


            }



            document.getElementById('violations_view').classList.remove('hidden');
            $("#dispositionViolationsResult").empty();
            violations = data.Violations;
            if (data.Violations.length > 0) {


                $("#dispositionViolationsResult").kendoGrid({
                    toolbar: ["excel"],
                    excel: {
                        fileName: "DispositionViolations.xlsx",
                        allPages: true
                    },
                    dataSource: {
                        data: data.Violations,
                        schema: {
                            model: {
                                fields: {
                                    ViolationId: { type: "number" },
                                    ViolationSubType: { type: "string" },
                                    ViolationStatus: { type: "string" },
                                    strViolationDate: { type: "string" },
                                    AdminNoticeNumber: { type: "string" },
                                    CreatedBy: { type: "string" },
                                    Notes: { type: "string" },
                                }
                            }
                        },
                        pageSize: 10
                    },
                    groupable: true,
                    scrollable: true,
                    sortable: true,
                    pageable:
                    {
                        pageSizes: true,
                        buttonCount: 3
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
                    //dataBound: onDataBound,
                    columns: [
                        { selectable: true, width: 70 },
                        { field: "AdminNoticeNumber", title: "Admin Notice Number", width: 280, template: "#= AdminNoticeNumber != null && AdminNoticeNumber !== undefined && AdminNoticeNumber !== '' ? AdminNoticeNumber : 'N/A' #" },
                        { field: "ViolationId", title: "Violation", width: 160, hidden: "true" },
                        { field: "ViolationSubType", title: "Violation", width: 200 },
                        { field: "strViolationDate", title: "Date", width: 130 },

                        { field: "CreatedBy", title: "Added by", width: 160, },
                        { field: "ViolationStatus", title: "Violation Status", width: 200 },
                        { field: "Notes", title: "Notes", width: 200 },
                    ]
                    , change: function (e, args) {
                        var grid = e.sender;
                        var items = grid.items();
                        items.each(function (idx, row) {

                            var idValue = grid.dataItem(row).get(idField);

                            if (row.className.indexOf("k-state-selected") >= 0) {
                                isRowSelected[idValue] = true;
                                SetSelectedRows(idValue, false);
                            } else if (isRowSelected[idValue]) {
                                delete isRowSelected[idValue];
                                SetSelectedRows(idValue, true);
                            }
                        });
                    },
                    dataBound: function (e) {
                        var grid = e.sender;
                        var items = grid.items();
                        items.each(function (idx, row) {

                            var dataItem = grid.dataItem(row);
                            if (isRowSelected[dataItem[idField]]) {
                                var idValue = grid.dataItem(row).get(idField);
                                SetSelectedRows(idValue, true);
                                itemsToSelect.push(row);
                            }
                            if (dataItem.ViolationStatus == 'CA-Violation Dismissed') {
                                //grid.select(row);
                                var checkbox = $(row).find("input[type=checkbox]");
                                $(checkbox).attr('disabled', true);
                                $(checkbox).attr('checked', true);
                            }
                            if (hideSelectableColumn) {
                                var columnIndex = 0; // Index of the selectable column

                                // Hide the selectable column
                                //    grid.hideColumn(columnIndex);
                                //grid.element.find(".k-checkbox").hide();
                                grid.element.find(".k-checkbox").css("display", "none");


                            } else {
                                var columnIndex = 0; // Index of the selectable column

                                // Show the selectable column
                                //    grid.showColumn(columnIndex);
                                grid.element.find(".k-checkbox").show();

                            }
                        });
                        e.sender.select(itemsToSelect);
                    },
                });
                var grid = $("#dispositionViolationsResult").data("kendoGrid");

                //if (data.AssignedToSupervisorId == data.EmployeeId || workItemType == 'LEG') {
                //    if (workItemType == 'CAS' && ($('#hdnIsClosedCase').val() != 'Yes' || $('#hdnIsViewOnlyUser').val() == 'No')) {
                //        
                //        $("#btnDismissViolation").show();
                //        $("#addViolation").show();
                //        grid.element.find(".k-checkbox").show();
                //    }      
                //}
                //else {
                //    $("#btnDismissViolation").hide();
                //    $("#addViolation").hide();
                //    grid.element.find(".k-checkbox").hide();
                //}


                if (subjectType == 'License') {
                    // SettlementCheck(caseId);
                    $('#dis_ddlAdminPnyViolationList option').remove();
                    $('#dis_ddlAdminPnyViolationList').append('<option value=-1>Select</option>');
                    $.each(violations, function () {
                        $('#dis_ddlAdminPnyViolationList').append('<option value=' +
                            this.ViolationId + '>' + this.ViolationSubType + '</option>');

                    });
                }
                else if (subjectType == 'Person') {
                    // $("#btnDismissViolation").hide();
                    // grid.element.find(".k-checkbox").hide();
                    $('#dis_ddlCriminalPnyViolationList option').remove();
                    $('#dis_ddlCriminalPnyViolationList').append('<option value=-1>Select</option>');
                    $.each(violations, function () {
                        $('#dis_ddlCriminalPnyViolationList').append('<option value=' +
                            this.ViolationId + '>' + this.ViolationSubType + '</option>');
                    });
                }

                //If the case is not accepted by legal dismiss violation should not be available for the legal user.
                if (data.Status != 'Forwarded to Legal' && getClosedCaseValue() != 'Yes') {
                    SettlementCheck(caseId);
                }
            }
            else {
                $("#btnDismissViolation").hide();
                if ($('#divNoRecordFoundMessage').length) {
                    disPlayNotExistMessage('No violations found on this case.');
                }
                //var popupNotification = $("#Notification").data("kendoNotification");
                //popupNotification.show({ message: "No violations found on this case." }, "warning");
            }
            getViolationAssociations(data.InvestigationId);
            loadAdminViolationDropdown();
            loadCriminalViolationDropdown();
            if (getClosedCaseValue() == 'Yes') {
                $('#btnDismissViolation').hide();
                $('#addViolation').hide();
                var grid = $("#dispositionViolationsResult").data("kendoGrid");
                grid.element.find(".k-checkbox").hide();
            }

        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went wrong. Please try again." }, "error");
        }
    });
    // document.getElementById('view_NotesTitle').classList.add('hidden');
}

function previewLegalCaseNotices(caseId, WorkItemTypeId) {
    if (caseId == 0) return;
    hideAllPartialViews('viewLegalNoticeResult');
    $.ajax({
        type: "GET",
        url: "/Enforcement/GetLegalNotice?caseId=" + caseId + "&WorkItemTypeId=" + WorkItemTypeId,
        dataType: "json",
        success: function (result) {
            $("#legalNoticeGrid").empty();
            $("#legalNoticeGrid").kendoGrid({
                toolbar: ["excel"],
                excel: {
                    fileName: "LegalNotice.xlsx",
                    allPages: true
                },
                dataSource: {
                    data: result,
                    schema: {
                        model: {
                            fields: {
                                RecordID: { type: "number" },
                                DocumentID: { type: "number" },
                                DocumentName: { type: "string" },
                                DocumentType: { type: "string" },
                                CreatedBy: { type: "string" },
                                CreatedDate: { type: "string" },
                            }
                        }
                    },
                    pageSize: 10
                },
                groupable: true,
                scrollable: true,
                sortable: true,
                pageable:
                {
                    pageSizes: true,
                    buttonCount: 3
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
                    { field: "RecordID", title: "RecordID", width: 160, hidden: "true" },
                    { field: "DocumentType", title: "Type", width: 150 },
                    { field: "DocumentName", title: "Document", width: 200 },
                    { field: "CreatedBy", title: "Generated By", width: 150 },
                    { field: "CreatedDate", title: "Generated Date", width: 100, template: "#= CreatedDate == null ? 'N/A' : kendo.toString(kendo.parseDate(CreatedDate, 'MM/dd/yyyy'),'MM/dd/yyyy') #" },
                ]
            });
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went wrong. Please try again." }, "error");
        }
    });
}

function createLegalNotice() {
    document.getElementById('divLigalNoticeList').classList.add('hidden');
    document.getElementById('divCreateLegalNoticeDocument').classList.remove('hidden');
}
//on dataBound event restore previous selected rows:
function onDataBound(e) {
    var view = this.dataSource.view();
    for (var i = 0; i < view.length; i++) {
        if (selectedViolationLst[view[i].ViolationId]) {
            this.tbody.find("tr[data-uid='" + view[i].uid + "']")
                .addClass("k-selected")
                .find(".k-checkbox")
                .attr("checked", "checked");
        }
    }
}

function SetSelectedRows(values, isDelete) {
    if (isDelete) {
        const index = selectedRows.indexOf(values);
        if (index !== -1) {
            selectedRows.splice($.inArray(values, selectedRows), 1);
        }
    }
    else {
        const index = selectedRows.indexOf(values);
        if (index == -1) {
            selectedRows.push(values);
        }
    }
}

function closeDismissViolationDialog() {
    $('#delete').hide();
    $('#delete').data("kendoDialog").close();
}

function onDismissViolationSave() {
    const workItem = getWorkItemType();
    var ReferenceItemID = workItem.ItemId;
    var ReferenceItemTypeID = workItem.ItemTypeId;
    var workItemId = $("#hdnWorkItemID").val();
    /*Leg*/
    if (selectedRows.length > 0) {
        $.ajax({
            type: "POST",
            url: "/Enforcement/DismissViolation?violationIds=" + JSON.stringify(selectedRows) + "&ReferenceItemTypeID=" + ReferenceItemTypeID + "&ReferenceItemID=" + ReferenceItemID + "&WorkItemId=" + workItemId,
            dataType: "json",
            success: function (results) {

                if (results == true) {
                    var popupNotification = $("#Notification").data("kendoNotification");
                    popupNotification.show({ message: "Violation dismissed successfully." }, "success", 5000);
                    previewCaseViolations();
                    selectedViolationLst = [];
                    itemsToSelect = [];
                    selectedRows = [];
                    isRowSelected = [];
                }
                else {
                    var popupNotification = $("#Notification").data("kendoNotification");
                    popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
                }
            },
            error: function (xhr) {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
            },
        });

    }
    else {
        var popupNotification = $("#Notification").data("kendoNotification");
        popupNotification.setOptions({
            autoHideAfter: 1500
        });
        popupNotification.show(
            { message: "No violation is selected, please try again." },
            "warning"
        );
    }
}

function closeDisposition() {
    

    var isError = false;
    var regex = /^[A-Za-z0-9,. ]+$/;

    var finalActionInput = document.getElementById('dis_ddlFinalAction').value;
    var notesInput = document.getElementById('dis_closureNotes').value;
    var filesInputCaseAction = $("#CaseAction_file").data("kendoUpload").getFiles();

    if (finalActionInput == -1) {
        document.getElementById('err_ddlFinalAction1').classList.remove('hidden');
        isError = true;
    } else {
        document.getElementById('err_ddlFinalAction1').classList.add('hidden');
    }

    if (filesInputCaseAction.length > 0 && filesInputCaseAction.length < 3) {
        for (var i = 0; i < filesInputCaseAction.length; i++) {
            if (filesInputCaseAction[i].size > 5242880) {
                document.getElementById('err_CaseActionfile').classList.remove('hidden');
                document.getElementById('err_CaseActionCount').classList.add('hidden');
                isError = true;
            }
            else {
                document.getElementById('err_CaseActionfile').classList.add('hidden');
                document.getElementById('err_CaseActionCount').classList.add('hidden');
            }
        }
    } else if (filesInputCaseAction.length > 2) {
        isError = true;
        document.getElementById('err_CaseActionfile').classList.add('hidden');
        document.getElementById('err_CaseActionCount').classList.remove('hidden');
    } else {
        document.getElementById('err_CaseActionfile').classList.add('hidden');
        document.getElementById('err_CaseActionCount').classList.add('hidden');
    }

    if (notesInput == "") {
        document.getElementById('err_closureNotes1').classList.remove('hidden');
        document.getElementById('formatErr_closureNotes1').classList.add('hidden');
        isError = true;
    } else if (notesInput.replace(/\s+/g, '') == "") {
        document.getElementById('err_closureNotes1').classList.add('hidden');
        document.getElementById('formatErr_closureNotes1').classList.remove('hidden');
        isError = true;
    } else {
        document.getElementById('err_closureNotes1').classList.add('hidden');
        document.getElementById('formatErr_closureNotes1').classList.add('hidden');
    }

    if (isError) return;

    var request = new Object();
    request.DispositionRecommendationId = caseId;
    request.FinalActionId = finalActionInput;
    request.ClosureNotes = notesInput;

    const workItem = getWorkItemType();
    request.ReferenceItemID = workItem.ItemId;
    request.ReferenceItemTypeID = workItem.ItemTypeId;

    if (filesInputCaseAction.length > 0) {
        var fileRequest = new FormData();
        for (var i = 0; i < filesInputCaseAction.length; i++) {
            fileRequest.append('requestFiles', filesInputCaseAction[i].rawFile)
        }

        $.ajax({
            type: "POST",
            enctype: 'multipart/form-data',
            url: "/Enforcement/UploadEnforcementFiles?uploadReason=" + "Case Action file upload",
            data: fileRequest,
            processData: false,
            contentType: false,
            cache: false,
            timeout: 600000,
            success: function (result) {
                request.IsFileUploaded = true;
                request.Files = result;
                SaveDispositionActions(request);
            },
            error: function (objError) {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "Error uploading file on investigation case action." }, "error");
            }
        });
    }
    else
        SaveDispositionActions(request)
}


function updateCaseStatus() {

    var isError = false;
    var regex = /^[A-Za-z0-9,. ]+$/;

    var caseStatus = document.getElementById('dis_ddlCaseStatus').value;
    var ddlSupervisor = document.getElementById('dis_ddlCaseSupervisor').value;
    var ddlCaseStatus = document.getElementById('dis_ddlCaseStatus');
    var ddlCaseStatusTest = ddlCaseStatus.options[ddlCaseStatus.selectedIndex].text;
    var combinedcase = document.getElementById('caseconfirmed').value;
    var ddlReturnToDivisionVal = document.getElementById('ddlReturnToDivisionFromLegal').value;

    var notesInput = document.getElementById('txt_CaseStatus').value;
    var filesInputCaseAction = $("#CaseAction_file").data("kendoUpload").getFiles();
    var caseStatusTxet = $("#dis_ddlCaseStatus option:selected").text();
    if (caseStatus == -1) {
        document.getElementById('err_ddlCaseStatus').classList.remove('hidden');
        isError = true;
    } else {
        document.getElementById('err_ddlCaseStatus').classList.add('hidden');
    }
    if (ddlCaseStatusTest == 'Forwarded to Supervisor for Review' || ddlCaseStatusTest == 'Returned for Corrections/Investigation') {
        if (ddlSupervisor == -1) {
            document.getElementById('err_dis_ddlCaseSupervisor').classList.remove('hidden');
            isError = true;
        }
        else {
            document.getElementById('err_dis_ddlCaseSupervisor').classList.add('hidden');
        }
    }
    if (ddlCaseStatusTest == 'Case Combined') {
        if (!combinedcase || combinedcase == '-1') {
            document.getElementById('err_dis_ddlCaseCombined').classList.remove('hidden');
            isError = true;
        }
        else
            document.getElementById('err_dis_ddlCaseCombined').classList.add('hidden');
    }

    if ($("#dis_ddlCaseStatus option:selected").text() == 'Returned to Division from Legal' && $("#ddlReturnToDivisionFromLegal").val() == "-1" ) {
            $("#err_returnToDivisionFromLegal").removeClass('hidden');
            isError = true;
    }

    //if (notesInput == "") {
    //    document.getElementById('err_CaseStatus').classList.remove('hidden');
    //    document.getElementById('formatErr_CaseStatus').classList.add('hidden');
    //    isError = true;
    //}
    //// else if (notesInput.replace(/\s+/g, '') == "" || !regex.test(notesInput)) {
    ////    document.getElementById('err_CaseStatus').classList.add('hidden');
    ////    document.getElementById('formatErr_CaseStatus').classList.remove('hidden');
    ////    isError = true;
    ////} 
    //else {
    //    document.getElementById('err_CaseStatus').classList.add('hidden');
    //    document.getElementById('formatErr_CaseStatus').classList.add('hidden');
    //}

    if (isError) return;

    var workItemId = $("#hdnWorkItemID").val();
    var applicationId = $("#hdnApplicationId").val();

    var request = new Object();
    request.CaseId = caseId;
    request.CaseStatusId = caseStatus;
    request.ActionNote = notesInput;
    request.WorkItemId = workItemId;
    request.Supervisor = ddlSupervisor;
    request.CombinedCaseId = combinedcase;
    request.ReturnToUserBy = ddlReturnToDivisionVal;
    
    SaveCaseStatus(request, caseStatusTxet);
    document.getElementById('txt_CaseStatus').value = '';
    document.getElementById('dis_ddlCaseSupervisor').value = '-1';
    document.getElementById('dis_ddlCaseStatus').value = '-1';
    document.getElementById('caseconfirmed').value = '-1';
    $("#divCaseAssociations").removeClass('hidden');
    $("#divCaseSupervisor").addClass('hidden');
    $("#divReturnToDivisionFromLegal").addClass('hidden');
    $("#err_returnToDivisionFromLegal").addClass('hidden');

}


var closeDailogbox = false;

function closeDialog() {
    $('#delete').hide();
    $('#delete').data("kendoDialog").close();
    closeDailogbox = false;
}

function OnLegalCaseClosefinalize() {
    var dialog = $("#delete");
    dialog.kendoDialog({
        width: "500px",
        title: false,
        closable: false,
        modal: true,
        content: ("<div class='text-center'>" +
            "</div>" +
            "<div class='text-center'>" +
            "Are you sure you want close the case ? Closing the case will also close the violation on this case." +
            "</div>"),
        actions: [
            { text: 'Cancel', action: closeDialog },
            { text: 'Yes', primary: true, action: onDismissViolationSave }
        ],
    });

    $("#delete").show();

    dialog.data("kendoDialog").open();
}

function UpdateLegalCaseStatusFinalize() {
    var isError = false;
    var regex = /^[A-Za-z0-9,. ]+$/;

    var caseStatus = document.getElementById('dis_ddlLegalCaseStatus').value;

    //var caseStatustext = $('#dis_ddlLegalCaseStatus option:selected').text();

    //alert(caseStatustext3);
    var notesInput = document.getElementById('txtLegalStatusNote').value;
    var otherStatusText = document.getElementById('txtOtherReason').value;
    var caseStatusTxet = $("#dis_ddlLegalCaseStatus option:selected").text();

    var workItemId = $("#hdnWorkItemID").val();
    var combinedCase = document.getElementById('ddlLegal_AssociatedCases').value;

    var returnToUserBy = document.getElementById('ddlReturnToDivision').value; 


    var request = new Object();
    request.CaseId = caseId;
    request.CaseStatusId = caseStatus;
    request.ActionNote = notesInput;
    request.WorkItemId = workItemId;
    request.OtherStatusText = otherStatusText;
    request.CaseStatus = caseStatusTxet;
    request.CombinedCaseId = combinedCase;
    request.ReturnToUserBy = returnToUserBy;

    $.ajax({
        type: "POST",
        url: "/Enforcement/UpdateLegalCaseStatus",
        contentType: "application/json",
        data: JSON.stringify(request),
        success: function (data) {

            if (data != 'False') {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "Request processed successfully." }, "success");
                $('#formLegalCaseStatus')[0].reset();

                if (caseStatusTxet == 'Case Closed' || caseStatusTxet == 'Case Combined' || caseStatusTxet == 'Case Dismissed') {
                    hideLegalCaseActions();
                }
                else {
                    $("#dis_ddlLegalCaseStatus option:contains('Reopen Case')").remove();
                }
                location.reload(true);
                // previewLegalInvCaseOverviewInformation_ReadOnly();
            }
            else {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "Case on appeal,so won't be able to close." }, "warning");
                $('#formLegalCaseStatus')[0].reset();
            }
        },
        error: function (objError) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Error while processing request" }, "error");
        }
    });
}

function UpdateLegalCaseStatus() {
    var isError = false;
    var regex = /^[A-Za-z0-9,. ]+$/;

    var caseStatus = document.getElementById('dis_ddlLegalCaseStatus').value;
    var returnToStatus = document.getElementById('ddlReturnToDivision').value;

    //var caseStatustext = $('#dis_ddlLegalCaseStatus option:selected').text();

    //alert(caseStatustext3);
    var notesInput = document.getElementById('txtLegalStatusNote').value;
    var otherStatusText = document.getElementById('txtOtherReason').value;
    var caseStatusTxet = $("#dis_ddlLegalCaseStatus option:selected").text();
    var combinedCase = document.getElementById('ddlLegal_AssociatedCases').value;

    if (caseStatus == -1) {
        document.getElementById('err_ddlLegalCaseStatus').classList.remove('hidden');
        isError = true;
    } else {
        document.getElementById('err_ddlLegalCaseStatus').classList.add('hidden');
    }

    if (caseStatusTxet == "Other" && otherStatusText == "") {
        document.getElementById('err_OtherReason').classList.remove('hidden');
        isError = true;
    }
    else {
        document.getElementById('err_OtherReason').classList.add('hidden');
    }

    if (returnToStatus == -1) {
        document.getElementById('err_returnToDivision').classList.remove('hidden');
        isError = true;
    } else {
        document.getElementById('err_returnToDivision').classList.add('hidden');
    }

    //if (notesInput == "") {
    //    document.getElementById('err_LegalLetterNote').classList.remove('hidden');
    //    document.getElementById('formatErr_LegalLetterNote').classList.add('hidden');
    //    isError = true;
    //} else
    /*if (notesInput.replace(/\s+/g, '') == "" || !regex.test(notesInput)) {*/
    //if (notesInput != "" && !regex.test(notesInput)) {
    //    document.getElementById('err_LegalLetterNote').classList.add('hidden');
    //    document.getElementById('formatErr_LegalLetterNote').classList.remove('hidden');
    //    isError = true;
    //} else {
    //    document.getElementById('err_LegalLetterNote').classList.add('hidden');
    //    document.getElementById('formatErr_LegalLetterNote').classList.add('hidden');
    //}

    if (caseStatusTxet == 'Case Combined') {
        if (!combinedCase || combinedCase == '-1') {
            document.getElementById('err_dis_ddlLegal_AssociatedCases').classList.remove('hidden');
            isError = true;
        }
        else {
            document.getElementById('err_dis_ddlLegal_AssociatedCases').classList.add('hidden');
        }
    }

    if (isError) return;


    if (caseStatusTxet == 'Closed') {
        var dialog = $("#delete");
        dialog.kendoDialog({
            width: "500px",
            title: false,
            closable: false,
            modal: true,
            content: ("<div class='text-center'>" +
                "</div>" +
                "<div class='text-center'>" +
                "Are you sure you want close the case ? Closing the case will also close the violation on this case." +
                "</div>"),
            actions: [
                { text: 'Cancel', action: closeDialog },
                { text: 'Yes', primary: true, action: UpdateLegalCaseStatusFinalize }
            ],
        });

        $("#delete").show();

        dialog.data("kendoDialog").open();
    }
    else {
        UpdateLegalCaseStatusFinalize();
    }

}

function SendSuspensionLetteToPulicUser() {

    var isError = false;
    var regex = /^[A-Za-z0-9,. ]+$/;

    var caseStatus = document.getElementById('dis_ddlCaseStatus').value;
    var notesInput = document.getElementById('txtLetterClosureNotes').value;
    var cutOffDate = document.getElementById('txtCutOffDate').value;
    var filesInputCaseAction = $("#uploadedFile").data("kendoUpload").getFiles();

    if (caseStatus == -1) {
        document.getElementById('err_ddlCaseStatus').classList.remove('hidden');
        isError = true;
    } else {
        document.getElementById('err_ddlCaseStatus').classList.add('hidden');
    }


    if (notesInput == "") {
        document.getElementById('err_LetterNote').classList.remove('hidden');
        document.getElementById('formatErr_LetterNote').classList.add('hidden');
        isError = true;
    } else if (notesInput.replace(/\s+/g, '') == "" || !regex.test(notesInput)) {
        document.getElementById('err_LetterNote').classList.add('hidden');
        document.getElementById('formatErr_LetterNote').classList.remove('hidden');
        isError = true;
    } else {
        document.getElementById('err_LetterNote').classList.add('hidden');
        document.getElementById('formatErr_LetterNote').classList.add('hidden');
    }

    if (cutOffDate == "") {
        document.getElementById('err_CutOffDate').classList.remove('hidden');
        isError = true;
    } else {
        document.getElementById('err_CutOffDate').classList.add('hidden');
    }

    if (filesInputCaseAction.length == 0) {
        document.getElementById('err_LetterDocument').classList.remove('hidden');
        isError = true;
    }
    else {
        document.getElementById('err_LetterDocument').classList.add('hidden');
    }

    if (isError) return;

    var workItemId = $("#hdnWorkItemID").val();

    var formData = new FormData();

    for (var i = 0; i < filesInputCaseAction.length; i++) { //loop through the files
        var file = filesInputCaseAction[i].rawFile;
        formData.append("uploadFiles", file); //append the property "rawFile" that holds the actual file in the FormData
    }

    formData.append("CaseId", caseId);
    formData.append("StatusId", caseStatus);
    formData.append("Notes", notesInput);
    formData.append("CutOffDate", cutOffDate);
    formData.append("WorkItemID", workItemId);

    $.ajax({
        url: "/Process/SendSuspensionLetter",
        type: 'post',
        contentType: false,
        processData: false,
        async: false,
        data: formData,
        success: function (response) {
            if (response == true) {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "Request processed successfully." }, "success");
                $('#frmSuspensionLetter')[0].reset();
                document.getElementById('txtCutOffDate').value = "";
                RenderMenuPartialView("Overview");
            }
            else {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "Error while processing request" }, "error");
            }
        },
        error: function (objError) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Error while processing request" + objError }, "error");
        }
    });
}

function SaveCaseStatus(request, caseStatusTxet) {
    $.ajax({
        type: "POST",
        url: "/Enforcement/UpdateCaseStatus",
        contentType: "application/json",
        data: JSON.stringify(request),
        success: function (data) {


            if (caseStatusTxet == 'Forwarded to Supervisor for Review' || caseStatusTxet == 'Returned for Corrections/Investigation') {
                var addRequest = new Object();
                addRequest.ItemId = request.CaseId;
                addRequest.WorkItemType = 'CAS';
                addRequest.AssignedInvestigatorID = request.Supervisor;
                addRequest.IsPrimary = 1;
                addRequest.strDateCreated = new Date().toLocaleString();
                addRequest.WorkItemId = -1;

                $.ajax({
                    type: "POST",
                    url: "/Enforcement/AddInvestigatorToWorkItem",
                    contentType: "application/json",
                    data: JSON.stringify(addRequest),
                    success: function (result) {

                        $("#divInvSupervisor").addClass('hidden');

                        //var popupNotification = $("#Notification").data("kendoNotification");
                        //if (result.StatusMessage == "Saved Record")
                        //    popupNotification.show({ message: "Added " + typeName + " on " + itemText }, "success");
                        //else
                        //    popupNotification.show({ message: result.StatusMessage + " on " + itemText }, "warning");
                        //document.getElementById('associatedInvestigatorsForm').reset();
                        //previewAssociatedInvestigators(false);
                    },
                    error: function (objError) {
                        //var popupNotification = $("#Notification").data("kendoNotification");
                        //popupNotification.show({ message: "Error adding investigator on " + itemText }, "error");
                    }
                });
            }



            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Request processed successfully." }, "success");
            //document.getElementById('closeDispositionForm').reset();
            $('#closeDispositionForm')[0].reset();
            //window.location = "/PrivateUser/PrivateUserDashboard#";
            location.reload(); // Reload the current page
            //if (caseStatusTxet === "Accepted by Legal Division") {
            //    window.location = "/PrivateUser/PrivateUserDashboard#";
            //} else {
            //    RenderMenuPartialView("Overview");
            //}

        },
        error: function (objError) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Error while processing request" }, "error");
        }
    });
}

function SaveDispositionActions(request) {
    $.ajax({
        type: "POST",
        url: "/Enforcement/CloseDispositionRecommendation",
        contentType: "application/json",
        data: JSON.stringify(request),
        success: function (data) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Request processed successfully." }, "success");
            document.getElementById('closeDispositionForm').reset();
            //previewInvCaseOverviewInformation();
            //    window.location = "/PrivateUser/PrivateUserDashboard#";
            location.reload(); // Reload the current page

        },
        error: function (objError) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Error while processing request" }, "error");
        }
    });
}

function previewSubjectLicenseData(licenseID) {
    $.ajax({
        type: "GET",
        url: "/ManagementReview/GetLicenseData?LicenseID=" + licenseID,
        success: function (data) {
            HideLoader();
            if (data != null) {
                var dataElements = "";
                dataElements += getDataElement('License ID', data.LicenseID, 'ion-pound');
                dataElements += getDataElement('License Name', data.LicenseName, 'ion-qr-scanner');
                if (data.MasterEntity == "") {
                    dataElements += getDataElement('Master Entity', 'None', 'ion-ios7-paper-outline');
                }
                else {
                    dataElements += getDataElement('Master Entity', data.MasterEntity, 'ion-ios7-paper-outline');
                }
                if (data.AddressLine1 == "") {
                    dataElements += getDataElement('Location', 'None', 'ion-map');
                }
                else {
                    dataElements += getDataElement('Location', data.AddressLine1 + ' ' + data.AddressLine2 + ' <br /> ' + data.City + ', ' + data.State + ' ' + data.ZipCode, 'ion-map');
                }
                dataElements += getDataElement('Standing', data.MRStanding, 'ion-filing');
                dataElements += getDataElement('Phone', data.PhoneNumber, 'ion-ios7-telephone-outline');
                dataElements += getDataElement('Email', data.Email, 'ion-ios7-email-outline');

                onSubjectDataBound(dataElements);
            }
            else {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "No record was found." }, "warning");
            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        },
    });
}

function previewSubjectPersonData(personId) {
    $.ajax({
        type: "GET",
        url: "/ManagementReview/GetPersonData?PersonID=" + personId,
        success: function (data) {
            if (data != null) {
                HideLoader();
                var dataElements = "";
                dataElements += getDataElement('Person ID', data.PersonID, 'ion-pound');
                if (data.AddressLine1 == "") {
                    dataElements += getDataElement('Location', 'None', 'ion-map');
                }
                else {
                    dataElements += getDataElement('Location', data.AddressLine1 + ' ' + data.AddressLine2 + ' <br /> ' + data.City + ', ' + data.State + ' ' + data.ZipCode, 'ion-map');
                }
                dataElements += getDataElement('Name', data.PersonName, 'ion-person');
                dataElements += getDataElement('Standing', data.MRStanding, 'ion-filing');

                onSubjectDataBound(dataElements);
            }
            else {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "No record was found." }, "warning");
            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        },
    });
}

function onSubjectDataBound(dataElements) {
    document.getElementById('viewSubjectData').classList.remove('hidden');
    document.getElementById('subjectRecordData').innerHTML = dataElements;
    $('html,body').animate({
        scrollTop: $("#subjectRecordData").offset().top
    }, 'slow');
}

function hideViewSubjectData() {
    document.getElementById('viewSubjectData').classList.add('hidden');
}

function getDataElement(title, value, className) {
    return (
        "<div class='col-lg-4 col-sm-4'>" +
        "<div class='media mt-3'>" +
        "<div class='mr-2 align-self-center'>" +
        "<i class='info-card-icon " + className + " m-0 text-primary'></i>" +
        "</div>" +
        "<div class='media-body overflow-auto'>" +
        "<p class='mb-1'>" + title + "</p>" +
        "<h5 class='info-card-h5 mt-0 value'>" + (value == '' ? 'No Data' : value) + "</h5>" +
        "</div>" +
        "</div>" +
        "</div>");
}
function getDataElement12Column(title, value, className) {
    return (
        "<div class='col-lg-12 col-sm-12'>" +
        "<div class='media mt-3'>" +
        "<i class='info-card-icon " + className + " m-0 text-primary'></i>" +
        "<div class='mr-2 align-self-center'>" +
        "</div>" +
        "<div class='media-body overflow-auto'>" +
        "<p class='mb-1'>" + title + "</p>" +
        "<div>" + (value == '' ? 'No Data' : value) + "</div>" +
        "</div>" +
        "</div>" +
        "</div>");
}


function previewDispositionAdminPenalties() {
    hideAllPartialViews('viewDispositionAdminPenalties');
    if (caseId == 0) return;
    //hideAllDivs('admin-penalties');
    //hideAllPartialViews('searchDispositionPartialView');
    //document.getElementById('dispositions-menu').classList.add('show');

    document.getElementById('viewDispositionAdminPenalties').classList.remove('hidden');
    loadDispositionAdminPenalties();
}

function loadDispositionAdminPenalties() {

    backDisAdminPenalty();
    $.ajax({
        type: "GET",
        url: "/Enforcement/GetDispositionAdminPenalties?dispositionRecommendationId=" + caseId,
        dataType: "json",
        success: function (data) {
            $("#adminPenaltiesResult").empty();
            if (data != null) {
                if (data.length > 0) {
                    $("#adminPenaltiesResult").kendoGrid({
                        toolbar: ["excel"],
                        excel: {
                            fileName: "AdminPenalties.xlsx",
                            allPages: true
                        },
                        dataSource: {
                            data: data,
                            schema: {
                                model: {
                                    fields: {
                                        AdminPenaltyId: { type: "number" },
                                        ResponseStatus: { type: "string" },
                                        ResponseDue: { type: "date" },
                                        ResponseFollowUp: { type: "date" },
                                        CreatedBy: { type: "string" },
                                    }
                                }
                            },
                            pageSize: 10
                        },
                        groupable: true,
                        scrollable: true,
                        sortable: true,
                        pageable:
                        {
                            pageSizes: true,
                            buttonCount: 3
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
                            { field: "AdminPenaltyId", title: "Id", width: 130, template: "<a href='\\#' class='link' onclick='previewAdminPenaltyDataById(\"#=AdminPenaltyId#\")'>#=AdminPenaltyId#</a>" },
                            { field: "ResponseStatus", title: "Status", width: 180 },
                            { field: "ResponseDue", title: "Due", width: 160, format: "{0:MM/dd/yyyy}" },
                            { field: "ResponseFollowUp", title: "Follow up", width: 160, format: "{0:MM/dd/yyyy}" },
                            { field: "CreatedBy", title: "Added by", width: 180, },
                        ]
                    });
                    checkForExistingPenalties();
                }
                else {
                    var popupNotification = $("#Notification").data("kendoNotification");
                    popupNotification.show({ message: "No admin penalties found on this case." }, "warning");
                }
            }
            else {
                var popupNotification = $('#Notification').data("kendoNotification");
                popupNotification.show({ message: "No record was found." }, "warning");
            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went wrong. Please try again." }, "error");
        }
    });
}

function backDisAdminPenalty() {
    document.getElementById('adminPenaltiesResult').classList.remove('hidden');
    document.getElementById('adminPenaltyView').classList.add('hidden');
}

function previewDispositionCriminalPenalties() {
    hideAllPartialViews('viewDispositionCriminalPenalties');
    if (caseId == 0) return;
    //hideAllDivs('criminal-penalties');
    //hideAllPartialViews('searchDispositionPartialView');
    //document.getElementById('dispositions-menu').classList.add('show');

    document.getElementById('viewDispositionCriminalPenalties').classList.remove('hidden');
    loadDispositionCriminalPenalties();
}

function addDisAdminPenalty() {

    var violations = JSON.parse(JSON.stringify($("#newAdminViolations").data("kendoGrid").dataSource.data()));
    var violationInput = document.getElementById('dis_ddlAdminPnyViolationList').value;

    for (var i = 0; i < violations.length; i++) {
        if (violations[i].ViolationId == violationInput) {
            document.getElementById('err_adminPnyViolationExists').classList.remove('hidden');
            return;
        }
        else
            document.getElementById('err_adminPnyViolationExists').classList.add('hidden');
    }

    if (violationInput == -1) {
        document.getElementById('err_ddlAdminPnyViolationList').classList.remove('hidden');
        return;
    } else {
        document.getElementById('err_ddlAdminPnyViolationList').classList.add('hidden');
    }

    var grid = $("#newAdminViolations").data("kendoGrid");
    var value = $("#newAdminViolations").data("kendoGrid").dataSource.data();

    var dispositionViolations = JSON.parse(JSON.stringify($("#dispositionViolationsResult").data("kendoGrid").dataSource.data()));
    var selectedViolation;

    for (var i = 0; i < dispositionViolations.length; i++) {
        if (dispositionViolations[i].ViolationId == violationInput)
            selectedViolation = dispositionViolations[i];
    }

    if (value.length == 0) {
        var dataSource = new kendo.data.DataSource({
            data: [
                {
                    ViolationId: "",
                    Violation: "",
                    ViolationDate: "",
                    Notes: "",
                    CreatedBy: "",
                }
            ],
            pageSize: 5
        });

        dataSource.add({
            ViolationId: selectedViolation.ViolationId,
            Violation: selectedViolation.ViolationSubType,
            ViolationDate: new Date(parseInt(selectedViolation.ViolationDate.substr(6))).toLocaleDateString('en-US'),
            Notes: selectedViolation.Notes,
            CreatedBy: selectedViolation.CreatedBy,
        });

        grid.setDataSource(dataSource);
        $("#newAdminViolations").data("kendoGrid").refresh();
        document.getElementById('dis_ddlAdminPnyViolationList').value = -1;
    }
    else {
        grid.dataSource.add({
            ViolationId: selectedViolation.ViolationId,
            Violation: selectedViolation.ViolationSubType,
            ViolationDate: new Date(parseInt(selectedViolation.ViolationDate.substr(6))).toLocaleDateString('en-US'),
            Notes: selectedViolation.Notes,
            CreatedBy: selectedViolation.CreatedBy,
        });
        $("#newAdminViolations").data("kendoGrid").refresh();
        document.getElementById('dis_ddlAdminPnyViolationList').value = -1;
    }
}

function createDisAdminPenalty() {
    var isError = false;

    var penaltyInput = document.getElementById('dis_ddlAdminPenaltyType').value;
    //var writtenNoticeInput = document.getElementById('dis_writtenNotice').value;
    var monetaryAmountInput = document.getElementById('dis_monetaryAmount').value;
    var suspensionDaysInput = document.getElementById('dis_suspensionDays').value;
    var suspensionStartInput = document.getElementById('dis_suspensionStart').value;
    var responseDateInput = document.getElementById('dis_responseDue').value;
    var responseFollowUpInput = document.getElementById('dis_responseFollowUp').value;
    var violations = JSON.parse(JSON.stringify($("#newAdminViolations").data("kendoGrid").dataSource.data()));

    if (penaltyInput == -1) {
        document.getElementById('err_ddlAdminPenaltyType').classList.remove('hidden');
        isError = true;
    } else {
        document.getElementById('err_ddlAdminPenaltyType').classList.add('hidden');
    }
    if (1 == penaltyInput || 3 == penaltyInput || 4 == penaltyInput) {
        if (responseDateInput > suspensionStartInput) {
            document.getElementById('err_responseDueValidate').classList.remove('hidden');
            document.getElementById('err_sameResponseDueValidate').classList.add('hidden');
            isError = true;
        } else {
            document.getElementById('err_responseDueValidate').classList.add('hidden');
        }
    }
    if (1 == penaltyInput || 3 == penaltyInput || 4 == penaltyInput) {
        if (responseFollowUpInput > suspensionStartInput) {
            document.getElementById('err_responseInputFollowUp').classList.remove('hidden');
            document.getElementById('err_sameResponseInputFollowUp').classList.add('hidden');
            isError = true;
        } else {
            document.getElementById('err_responseInputFollowUp').classList.add('hidden');
        }
    }
    if (1 == penaltyInput || 3 == penaltyInput || 4 == penaltyInput) {
        if (responseDateInput == suspensionStartInput) {
            document.getElementById('err_sameResponseDueValidate').classList.remove('hidden');
            document.getElementById('err_responseDueValidate').classList.add('hidden');
            isError = true;
        } else {
            document.getElementById('err_sameResponseDueValidate').classList.add('hidden');

        }
    }
    if (1 == penaltyInput || 3 == penaltyInput || 4 == penaltyInput) {
        if (responseFollowUpInput == suspensionStartInput) {
            document.getElementById('err_sameResponseInputFollowUp').classList.remove('hidden');
            document.getElementById('err_responseInputFollowUp').classList.add('hidden');
            isError = true;
        } else {
            document.getElementById('err_sameResponseInputFollowUp').classList.add('hidden');
        }
    }
    //if (writtenNoticeInput == "") {
    //    document.getElementById('err_writtenNotice').classList.remove('hidden');
    //    isError = true;
    //} else {
    //    document.getElementById('err_writtenNotice').classList.add('hidden');
    //}

    if (penaltyInput == 2 || penaltyInput == 3 || penaltyInput == 4) {
        if (monetaryAmountInput == "") {
            document.getElementById('err_monetaryAmount').classList.remove('hidden');
            isError = true;
        } else {
            document.getElementById('err_monetaryAmount').classList.add('hidden');
        }
    }

    if (penaltyInput == 1 || penaltyInput == 3 || penaltyInput == 4) {
        if (suspensionDaysInput == "") {
            document.getElementById('err_suspensionDays').classList.remove('hidden');
            isError = true;
        } else {
            document.getElementById('err_suspensionDays').classList.add('hidden');
        }

        if (suspensionStartInput == "") {
            document.getElementById('err_suspensionStart').classList.remove('hidden');
            isError = true;
        } else {
            document.getElementById('err_suspensionStart').classList.add('hidden');
        }
    }

    if (responseDateInput == "") {
        document.getElementById('err_responseDue').classList.remove('hidden');
        isError = true;
    } else {
        document.getElementById('err_responseDue').classList.add('hidden');
    }

    if (responseFollowUpInput == "") {
        document.getElementById('err_responseFollowUp').classList.remove('hidden');
        isError = true;
    } else {
        document.getElementById('err_responseFollowUp').classList.add('hidden');
    }

    if (violations.length == 0) isError = true;

    if (isError || noticeNumberExists) return;

    if (suspensionStartInput != "") {
        var dateObjX = new Date(suspensionStartInput);
        suspensionStartInput = new Date(dateObjX.getTime() + 8 * 6000000);
    }
    if (responseDateInput != "") {
        var dateObjY = new Date(responseDateInput);
        responseDateInput = new Date(dateObjY.getTime() + 8 * 6000000);
    }
    if (responseFollowUpInput != "") {
        var dateObjZ = new Date(responseFollowUpInput);
        responseFollowUpInput = new Date(dateObjZ.getTime() + 8 * 6000000);
    }
    var workItemId = $("#hdnWorkItemID").val();

    var createRequest = new Object();
    createRequest.DispositionRecommendationId = caseId;
    createRequest.Violations = violations;
    createRequest.PenaltyTypeId = penaltyInput;
    createRequest.WrittenNoticeNumber = 0;
    createRequest.MonetaryAmount = monetaryAmountInput;
    createRequest.SuspensionDays = suspensionDaysInput;
    createRequest.SuspensionStart = suspensionStartInput;
    createRequest.ResponseDue = responseDateInput;
    createRequest.ResponseFollowUp = responseFollowUpInput;
    const workItem = getWorkItemType();
    createRequest.ReferenceItemID = workItem.ItemId;
    createRequest.ReferenceItemTypeID = workItem.ItemTypeId;

    $.ajax({
        type: "POST",
        url: "/Enforcement/CreateDispositionAdminPenalty",
        contentType: "application/json",
        data: JSON.stringify(createRequest),
        success: function (data) {
            var popupNotification = $("#Notification").data("kendoNotification");
            if (data > 0) {
                popupNotification.show({ message: "Request processed successfully." }, "success");
                resetCreateDisAdminPenalty();
                loadDispositionAdminPenalties();
                document.getElementById("adminPenaltiesForm").classList.add("hidden");
                document.getElementById("adminPenaltyExists").classList.remove("hidden");
                checkForExistingPenalties();
            }
            else
                popupNotification.show({ message: "Error while processing request" }, "error");
        },
        error: function (objError) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Error while processing request" }, "error");
        }
    });
}

function resetCreateDisAdminPenalty() {
    $("#newAdminViolations").data("kendoGrid").dataSource.data([]);
    document.getElementById("adminPenaltiesForm").reset();
    var els = document.getElementsByClassName('field-validation-error');
    Array.prototype.forEach.call(els, function (el) {
        el.classList.add('hidden');
    });
    document.getElementById('monetaryAmount').classList.add('hidden');
    document.getElementById('suspensionDays').classList.add('hidden');
    document.getElementById('suspensionStart').classList.add('hidden');
}

function cancelAdminPenalty() {

    var penaltyId = document.getElementById("viewPenaltyID").value;//.innerHTML;
    if (penaltyId == 'None') return;
    var createRequest = new Object();
    createRequest.DispositionRecommendationId = caseId;
    createRequest.AdminPenaltyId = penaltyId;
    const workItem = getWorkItemType();
    createRequest.ReferenceItemID = workItem.ItemId;
    createRequest.ReferenceItemTypeID = workItem.ItemTypeId;

    $.ajax({
        type: "POST",
        url: "/Enforcement/CancelDispositionAdminPenalty",
        contentType: "application/json",
        data: JSON.stringify(createRequest),
        success: function (data) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Request processed successfully." }, "success");
            previewPenalty();
            //previewSearchDisposition();
        },
        error: function (objError) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Error while processing request" }, "error");
        }
    });
}

function enablePenaltyConditionalFields(value) {
    if (value == 2 || value == 3 || value == 4) {
        document.getElementById('monetaryAmount').classList.remove('hidden');
    } else {
        document.getElementById('monetaryAmount').classList.add('hidden');
    }
    if (value == 1 || value == 3 || value == 4) {
        document.getElementById('suspensionDays').classList.remove('hidden');
        document.getElementById('suspensionStart').classList.remove('hidden');
    } else {
        document.getElementById('suspensionDays').classList.add('hidden');
        document.getElementById('suspensionStart').classList.add('hidden');
    }
}

function checkIfNoticeNumberExists(value) {
    noticeNumberExists = false;
    document.getElementById("err_writtenNoticeExists").classList.add("hidden");
    if (value == null || value == "")
        return;
    $.ajax({
        type: "GET",
        url: "/Enforcement/CheckIfNoticeNumberExists?noticeNumber=" + value,
        dataType: "json",
        success: function (data) {
            if (data != null) {
                if (data.IsExists == true) {
                    noticeNumberExists = true;
                    document.getElementById("err_writtenNotice").classList.add("hidden");
                    document.getElementById("err_writtenNoticeExists").classList.remove("hidden");
                }
            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went wrong. Please try again." }, "error");
        }
    });
}

function checkForExistingPenalties() {

    $.ajax({
        type: "GET",
        url: "/Enforcement/CheckForExistingPenalties?dispositionRecommendationId=" + caseId,
        dataType: "json",
        success: function (data) {
            if (data != null) {

                //hideAllDivs('view-disposition');
                // hideAllPartialViews('searchDispositionPartialView');
                //document.getElementById('dispositions-menu').classList.add('show');

                if (data.IsExists == true) {
                    document.getElementById("adminPenaltiesForm").classList.add("hidden");
                    document.getElementById("adminPenaltyExists").classList.remove("hidden");

                    document.getElementById('viewPnyInvestigationID').innerHTML =
                        data.InvestigationId > 0 ? "<a href='#' class='link' onclick='previewInvestigationDataById(" + data.InvestigationId + ", true)'>" + data.CustomInvNumber + "</a>" : 'None';
                    document.getElementById('viewPnyInvestigatingCPO').innerHTML = data.InvestigatingCPO != null ? data.InvestigatingCPO : 'None';
                    document.getElementById('viewPnyLicenseID').innerHTML = data.LicenseId;
                }
                else {
                    document.getElementById('adminPenaltiesForm').classList.remove('hidden');
                    document.getElementById('adminPenaltyExists').classList.add('hidden');
                }
            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went wrong. Please try again." }, "error");
        }
    });
}

function previewAdminPenaltyDataById(id) {

    document.getElementById('adminPenaltiesResult').classList.add('hidden');
    document.getElementById('adminPenaltyView').classList.remove('hidden');
    $.ajax({
        type: "GET",
        url: "/Enforcement/GetDispositionAdminPenaltyById?adminPenaltyId=" + id,
        dataType: "json",
        success: function (data) {
            if (data != null) {

                var dataElements = "";
                dataElements += getDataElement('Admin Penalty Id', data.AdminPenaltyId, 'ion-pound');

                document.getElementById('viewPenaltyID').value = data.AdminPenaltyId;
                dataElements += getDataElement('Penalty Type', data.PenaltyType, 'ion-calendar');
                /*Commented by Pedram 9/22/2021*/
                /*  dataElements += getDataElement('Written Notice Number', data.WrittenNoticeNumber, 'ion-folder');*/
                if (data.MonetaryAmount > 0)
                    dataElements += getDataElement('Monetary Amount', data.MonetaryAmount, 'ion-person');
                if (data.SuspensionDays > 0)
                    dataElements += getDataElement('Suspension Days', data.SuspensionDays, 'ion-stats-bars');
                var x = new Date(data.SuspensionStart);
                //if (!isNaN(x.getTime()))
                if (data.PenaltyType != "Monetary" && data.PenaltyType != "Warning") {
                    dataElements += getDataElement('Suspension Start', (data.SuspensionStart != "" && data.SuspensionStart != "/Date(-62135596800000)/") ? new Date(parseInt(data.SuspensionStart.substr(6))).toLocaleDateString('en-US') : 'None', 'ion-cube');
                }
                dataElements += getDataElement('Status', data.ResponseStatus, 'ion-refresh');
                dataElements += getDataElement('Due', new Date(parseInt(data.ResponseDue.substr(6))).toLocaleDateString('en-US'), 'ion-ios7-paper-outline');
                dataElements += getDataElement('Follow Up', new Date(parseInt(data.ResponseFollowUp.substr(6))).toLocaleDateString('en-US'), 'ion-ios7-paper-outline');

                document.getElementById('adminPenaltyDetails').innerHTML = dataElements;

                if (data.ResponseStatus == 'Closed') document.getElementById('btnDetailsCancelPenalty').classList.add('hidden');

                if (data.Violations != null && data.Violations.length > 0) {
                    $("#adminViolations").empty();
                    $("#adminViolations").kendoGrid({
                        toolbar: ["excel"],
                        excel: {
                            fileName: "AdminPenaltyViolations.xlsx",
                            allPages: true
                        },
                        dataSource: {
                            data: data.Violations,
                            schema: {
                                model: {
                                    fields: {
                                        ViolationId: { type: "number" },
                                        ViolationSubType: { type: "string" },
                                        ViolationDate: { type: "date" },
                                        Notes: { type: "string" },
                                        CreatedBy: { type: "string" },
                                    }
                                }
                            },
                            pageSize: 10
                        },
                        groupable: true,
                        scrollable: true,
                        sortable: true,
                        pageable:
                        {
                            pageSizes: true,
                            buttonCount: 3
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
                            { field: "ViolationId", title: "Violation", width: 180, hidden: "true" },
                            { field: "ViolationSubType", title: "Violation", width: 180 },
                            { field: "ViolationDate", title: "Date", width: 160, format: "{0:MM/dd/yyyy}" },
                            { field: "Notes", title: "Notes", width: 200 },
                            { field: "CreatedBy", title: "Added by", width: 160, }
                        ]
                    });
                }
                else {
                    if ($('#divNoRecordFoundMessage').length) {
                        disPlayNotExistMessage('No violations found on this admin penalty.');
                    }
                    //var popupNotification = $("#Notification").data("kendoNotification");
                    //popupNotification.show({ message: "No violations found on this admin penalty." }, "warning");
                }
            }
            else {
                var popupNotification = $('#Notification').data("kendoNotification");
                popupNotification.show({ message: "No record was found." }, "warning");
            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went wrong. Please try again." }, "error");
        }
    });
}

//Attach Court

function previewDispositionCourtAttachment() {
    if (caseId == 0) return;
    var caseTypeId = $('#hdnCaseTypeId').val();
    if (caseTypeId == 1) { //caseType = 'Admin Case';
        document.getElementById('div_docketNumber').classList.remove('hidden');
    }
    else { //  caseType = 'Criminal Case';
        document.getElementById('div_docketNumber').classList.add('hidden');
        document.getElementById('dis_docketNumber').value = '';
    }


    document.getElementById('viewDispositionCourtAttachment').classList.remove('hidden');
    loadDispositionCourtAttachments();
    if (document.getElementById('courtAttachmentNotesForm')) {
        if (getClosedCaseValue() == 'Yes') {
            document.getElementById('courtAttachmentNotesForm').classList.add('hidden');
        }
        else {
            document.getElementById('courtAttachmentNotesForm').classList.remove('hidden');
        }
    }
}

function previewCaseNotes(caseId) {
    
    if (caseId == 0) return;
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    selectedworkitemType = urlParams.get('WorkitemType');
    selectedworkitemType = selectedworkitemType.replace('_Search', '');
    selectedworkitemType = selectedworkitemType.replace('_Create', '');
    selectedworkitemType = selectedworkitemType.replace('#', '');

    $.ajax({
        type: "GET",
        url: "/Enforcement/GetNotesDetails?recordId=" + caseId + "&recTypeId=" + selectedworkitemType,
        contentType: "application/html",
        dataType: "html",
        success: function (results) {
            hideAllPartialViews('viewCaseNotes');
            $("#viewCaseNotes").html(results);

            if (getClosedCaseValue() == 'Yes' || getViewAccess() == 'Yes') {
                document.getElementById('addNotes_view').classList.add("hidden");
                $('#addNotes').hide()
            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        },
    });


}

//function loadDispositionCourtAttachments() {
//    backDisCourtAttachment();
//    document.getElementById('viewDispositionRecommendationIDCourt').innerHTML = $('#hdnApplicationId').val();
//    $.ajax({
//        type: "GET",
//        url: "/Enforcement/GetDispositionCourtAttachments?dispositionRecommendationId=" + caseId,
//        dataType: "json",
//        success: function (data) {
//            $("#courtAttachmentsResult").empty();
//            if (data != null) {
//                if (data.length > 0) {
//                    $("#courtAttachmentsResult").kendoGrid({
//                        toolbar: ["excel"],
//                        excel: {
//                            fileName: "CriminalCourtAttachments.xlsx",
//                            allPages: true
//                        },
//                        dataSource: {
//                            data: data,
//                            schema: {
//                                model: {
//                                    fields: {
//                                        CourtAttachmentId: { type: "number" },
//                                        CourtNumber: { type: "string" },
//                                        DateFiled: { type: "date" },
//                                        Place: { type: "string" },
//                                        CreatedBy: { type: "string" },
//                                    }
//                                }
//                            },
//                            pageSize: 10
//                        },
//                        groupable: true,
//                        scrollable: true,
//                        sortable: true,
//                        pageable:
//                        {
//                            pageSizes: true,
//                            buttonCount: 3
//                        },
//                        filterable: {
//                            extra: false,
//                            operators: {
//                                string: {
//                                    startswith: "Starts with",
//                                    eq: "Is equal to",
//                                    neq: "Is not equal to"
//                                }
//                            }
//                        },
//                        columns: [
//                            { field: "CourtAttachmentId", title: "Id", width: 130, template: "<a href='\\#' class='link' onclick='previewCourtAttachmentDataById(\"#=CourtAttachmentId#\")'>#=CourtAttachmentId#</a>" },
//                            { field: "CourtNumber", title: "Court Number", width: 180 },
//                            { field: "DateFiled", title: "Date", width: 160, format: "{0:MM/dd/yyyy}" },
//                            { field: "Place", title: "Place", width: 160, },
//                            //{ field: "CaseCourtType", title: "Court Type 1", width: 160, },
//                            { field: "CreatedBy", title: "Added by", width: 160, },
//                        ]
//                    });
//                }
//                else {
//                    var popupNotification = $("#Notification").data("kendoNotification");
//                    popupNotification.show({ message: "No court attachments found on this case." }, "warning");
//                }
//            }
//            else {
//                var popupNotification = $('#Notification').data("kendoNotification");
//                popupNotification.show({ message: "No record was found." }, "warning");
//            }
//        },
//        error: function (xhr) {
//            var popupNotification = $("#Notification").data("kendoNotification");
//            popupNotification.show({ message: "Something went wrong. Please try again." }, "error");
//        }
//    });
//}

var selectedCourtAttachmentId = 0;
function previewCourtAttachmentDataById(id) {
    selectedCourtAttachmentId = id;
    document.getElementById('courtAttachmentsResult').classList.add('hidden');
    document.getElementById('courtAttachmentView').classList.remove('hidden');
    $.ajax({
        type: "GET",
        url: "/Enforcement/GetDispositionCourtAttachmentById?courtAttachmentId=" + id,
        dataType: "json",
        success: function (data) {
            if (data != null) {
                var dataElements = "";
                dataElements += getDataElement('Court Attachment Id', data.CourtAttachmentId, 'ion-pound');
                if (data.CourtType != null)
                    dataElements += getDataElement('Court Type', data.CourtType, 'ion-pound');
                if (data.CourtNumber != null)
                    dataElements += getDataElement('Court Number', data.CourtNumber, 'ion-pound');
                if (data.Place != null)
                    dataElements += getDataElement('Place', data.Place, 'ion-stats-bars');
                if (data.DateFiled != null)
                    dataElements += getDataElement('Date Filed', data.DateFiled != "" ? new Date(parseInt(data.DateFiled.substr(6))).toLocaleDateString('en-US') : 'None', 'ion-cube');
                if (data.DocketNumber != null)
                    dataElements += getDataElement('Docket Number', data.DocketNumber, 'ion-pound');
                if (data.JurisdictionType != null)
                    dataElements += getDataElement('Jurisdiction Type', data.JurisdictionType, 'ion-cube');
                if (data.CourtNote != null)
                    dataElements += getDataElement12Column('Court Note', data.CourtNote, 'ion-ios7-paper-outline');

                document.getElementById('courtAttachmentDetails').innerHTML = dataElements;
                previewCourtAttachmentNotes(id);
            }
            else {
                var popupNotification = $('#Notification').data("kendoNotification");
                popupNotification.show({ message: "No record was found." }, "warning");
            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went wrong. Please try again." }, "error");
        }
    });
}

function previewCourtAttachmentNotes(id) {
    $.ajax({
        type: "GET",
        url: "/Enforcement/GetEnforcementNotes?recordId=" + id + "&recordType=" + "CourtAttachment",
        dataType: "json",
        success: function (results) {
            $("#courtAttachmentNotes").empty();
            if (results.result.length > 0) {
                $("#courtAttachmentNotes").kendoGrid({
                    toolbar: ["excel"],
                    excel: {
                        fileName: "CourtAttachmentNotes.xlsx",
                        allPages: true,
                    },
                    dataSource: {
                        data: results.result,
                        schema: {
                            model: {
                                fields: {
                                    NoteType: { type: "string" },
                                    CreatedBy: { type: "string" },
                                    DateCreated: { type: "date" },
                                    Notes: { type: "string" },
                                    Files: [{ FileId: { type: "number" } }, { FileName: { type: "string" } }]
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
                        { field: "NoteType", title: "Type", width: 130 },
                        { field: "CreatedBy", title: "Added by", width: 160 },
                        { field: "DateCreated", title: "Date", width: 160, format: "{0:MM/dd/yyyy}" },
                        { field: "Notes", title: "Notes", width: 200 },
                        { field: "Files", title: "Attachments", width: 180, template: "#=generateFilesTemplate(Files)#" },
                    ]
                });
            }
            else {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "No notes are found on this record." }, "warning");
            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        },
    });
}

function backDisCourtAttachment() {
    document.getElementById('courtAttachmentsResult').classList.remove('hidden');
    document.getElementById('courtAttachmentView').classList.add('hidden');
}

function createCourtAttachment() {
    var courtTypeInput = document.getElementById('dis_CourtType').value;
    var courtNumberInput = document.getElementById('dis_courtNumber').value;
    var courtNoteInput = document.getElementById('dis_courtNotes1').value;
    var placeInput = document.getElementById('dis_place').value;
    var dateFiledInput = document.getElementById('dis_dateFiled').value;
    var docketNumberInput = document.getElementById('dis_docketNumber').value;
    var jurisdictionTypeInput = document.getElementById('dis_Jurisdiction').value;

    if (dateFiledInput != "") {
        var dateObj = new Date(dateFiledInput);
        dateFiledInput = new Date(dateObj.getTime() + 8 * 6000000);
    }

    //var isError = false;
    //if (courtTypeInput == null || courtTypeInput < 1) {
    //    document.getElementById('err_ddlCourtType').classList.remove('hidden');
    //    isError = true;
    //}
    //else {
    //    document.getElementById('err_ddlCourtType').classList.add('hidden');
    //}

    //if (jurisdictionTypeInput == null || jurisdictionTypeInput < 1) {
    //    document.getElementById('err_ddlJurisdictionType').classList.remove('hidden');
    //    isError = true;
    //}
    //else {
    //    document.getElementById('err_ddlJurisdictionType').classList.add('hidden');
    //}

    //if (courtNumberInput == null || courtNumberInput =='') {
    //    document.getElementById('err_CourtNumber').classList.remove('hidden');
    //    isError = true;
    //}
    //else {
    //    document.getElementById('err_CourtNumber').classList.add('hidden');
    //}


    //if (isError) return;

    var createRequest = new Object();
    createRequest.DispositionRecommendationId = caseId;
    createRequest.CourtType = courtTypeInput;
    createRequest.CourtNumber = courtNumberInput;
    createRequest.Place = placeInput;
    createRequest.DateFiled = dateFiledInput;
    createRequest.DocketNumber = docketNumberInput;
    createRequest.JurisdictionType = jurisdictionTypeInput;
    const workItem = getWorkItemType();
    createRequest.ReferenceItemID = workItem.ItemId;
    createRequest.ReferenceItemTypeID = workItem.ItemTypeId;
    createRequest.CourtNote = courtNoteInput;

    $.ajax({
        type: "POST",
        url: "/Enforcement/CreateDispositionCourtAttachment",
        contentType: "application/json",
        data: JSON.stringify(createRequest),
        success: function (data) {
            var popupNotification = $("#Notification").data("kendoNotification");
            if (data > 0) {
                popupNotification.show({ message: "Request processed successfully." }, "success");
                resetCreateCourtAttachment();
                loadDispositionCourtAttachments();
            }
            else
                popupNotification.show({ message: "Error while processing request" }, "error");
        },
        error: function (objError) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Error while processing request" }, "error");
        }
    });
}

function resetCreateCourtAttachment() {
    document.getElementById("courtattachmentForm").reset();
    var els = document.getElementsByClassName('field-validation-error');
    Array.prototype.forEach.call(els, function (el) {
        el.classList.add('hidden');
    });
}

//function countCourtNotesCharacters(e) {
//    var textEntered, counter;
//    textEntered = document.getElementById('dis_courtNotes').value;
//    counter = (500 - (textEntered.length));
//    document.getElementById('courtNotesCounter').textContent = counter;
//}

function addCourtNotes() {
    var isError = false;
    var regex = /^[A-Za-z0-9,. ]+$/;

    var fileTypeInput = document.getElementById('dis_ddlFileType').value;
    var notesInput = document.getElementById('dis_courtNotes').value;
    var filesInput = $("#dis_file").data("kendoUpload").getFiles();

    if (fileTypeInput == -1) {
        document.getElementById('err_ddlFileType').classList.remove('hidden');
        isError = true;
    } else {
        document.getElementById('err_ddlFileType').classList.add('hidden');
    }

    if (notesInput == "") {
        document.getElementById('err_courtNotes').classList.remove('hidden');
        document.getElementById('formatErr_courtNotes').classList.add('hidden');
        isError = true;
    } else if (notesInput.replace(/\s+/g, '') == "" || !regex.test(notesInput)) {
        document.getElementById('err_courtNotes').classList.add('hidden');
        document.getElementById('formatErr_courtNotes').classList.remove('hidden');
        isError = true;
    } else {
        document.getElementById('err_courtNotes').classList.add('hidden');
        document.getElementById('formatErr_courtNotes').classList.add('hidden');
    }

    if (filesInput.length > 0 && filesInput.length < 3) {
        for (var i = 0; i < filesInput.length; i++) {
            if (filesInput[i].size > 5242880) {
                document.getElementById('err_DisFile').classList.remove('hidden');
                document.getElementById('err_DisFileCount').classList.add('hidden');
                isError = true;
            }
            else {
                document.getElementById('err_DisFile').classList.add('hidden');
                document.getElementById('err_DisFileCount').classList.add('hidden');
            }
        }
    } else if (filesInput.length > 2) {
        isError = true;
        document.getElementById('err_DisFile').classList.add('hidden');
        document.getElementById('err_DisFileCount').classList.remove('hidden');
    } else {
        document.getElementById('err_DisFile').classList.add('hidden');
        document.getElementById('err_DisFileCount').classList.add('hidden');
    }

    if (isError) return;

    const workItem = getWorkItemType();
    var notesRequest = new Object();
    notesRequest.RecordId = selectedCourtAttachmentId;
    notesRequest.RecordType = 'CourtAttachment';
    notesRequest.RecordTypeID = workItem.ItemTypeId;
    notesRequest.ReferenceItemID = workItem.ItemId;
    notesRequest.NoteTypeId = fileTypeInput;
    notesRequest.Notes = notesInput;
    notesRequest.IsFileUploaded = false;
    notesRequest.IsActive = true;
    notesRequest.Files = null;
    notesRequest.IsActive = true;
    notesRequest.DateCreated = new Date().toLocaleString();

    if (filesInput.length > 0) {
        var fileRequest = new FormData();
        for (var i = 0; i < filesInput.length; i++) {
            fileRequest.append('requestFiles', filesInput[i].rawFile)
        }

        $.ajax({
            type: "POST",
            enctype: 'multipart/form-data',
            url: "/Enforcement/UploadEnforcementFiles?uploadReason=" + "Court Attachment notes file upload",
            data: fileRequest,
            processData: false,
            contentType: false,
            cache: false,
            timeout: 600000,
            success: function (result) {
                notesRequest.IsFileUploaded = true;
                notesRequest.Files = result;
                saveCourtNotes(notesRequest);
            },
            error: function (objError) {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "Error uploading file on investigation." }, "error");
            }
        });
    }
    else
        saveCourtNotes(notesRequest);
}

function saveCourtNotes(notesRequest) {
    $.ajax({
        type: "POST",
        url: "/Enforcement/SaveEnforcementNotes",
        contentType: "application/json",
        data: JSON.stringify(notesRequest),
        success: function (data) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Added notes on court attachment." }, "success");
            document.getElementById('courtAttachmentNotesForm').reset();
            //document.getElementById('courtNotesCounter').textContent = '500';
            previewCourtAttachmentNotes(selectedCourtAttachmentId);
        },
        error: function (objError) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Error adding notes on court attachment." }, "error");
        }
    });
}

function generateFilesTemplate(files) {
    var fileUrls = "";
    var index = 0;
    if (files.length > 0) {
        for (var i = 0; i < files.length; i++) {
            if (i > index) {
                index = i;
                fileUrls += "<br />"
            }
            fileUrls += "<a href='/Enforcement/DownloadFile?FileID=" + files[i].EncriptedFileId + "' target='_blank' class='link'>" + files[i].FileName + "</a>"
        }
    }
    else {
        fileUrls = "None";
    }

    return fileUrls;
}

function updateDisposition() {
    //
    var isError = false;
    var isClassifiedInput = document.getElementById('viewDisIsClassified').value;
    var isJuvenileJusticeInput = document.getElementById('viewDisIsJuvenile').value;
    var isCaseAdoptedInput = document.getElementById('viewDisIsCaseAdopted').value;
    var isRepresentedByLawyer = document.getElementById('isReprsentedByLawyer').value;
    //var soahNumber = document.getElementById('txtSOAHNumber').value;

    var isCaseType = document.getElementById('viewCaseType').innerHTML;
    if (isCaseType == "Criminal Case" && $("#hasAuditInvestigatorOnly").val() == "True") {
        isError = true;
        var popupNotification = $("#Notification").data("kendoNotification");
        popupNotification.show({ message: "Auditor Investigator cannot update Criminal Case." }, "error");
    }

    var filesInput = $("#dis_file_LR").data("kendoUpload").getFiles();
    if (isRepresentedByLawyer == 'true') {
        if (filesInput.length <= 0 && lrFilesCount <= 0) {
            isError = true;
            document.getElementById('formatErr_DisFileEdit').classList.remove('hidden');
        }
        else { document.getElementById('formatErr_DisFileEdit').classList.add('hidden'); }
    }
    else { document.getElementById('formatErr_DisFileEdit').classList.add('hidden'); }
    //if (filesInput.length > 0 && filesInput.length < 3) {
    //    for (var i = 0; i < filesInput.length; i++) {
    //        if (filesInput[i].size > 5242880) {
    //            document.getElementById('err_file').classList.remove('hidden');
    //            document.getElementById('err_fileCount').classList.add('hidden');
    //            isError = true;
    //        }
    //else {
    //    document.getElementById('err_file').classList.add('hidden');
    //    document.getElementById('err_fileCount').classList.add('hidden');
    //}
    // }
    // }
    //} else if (filesInput.length > 2) {
    //    isError = true;
    //    document.getElementById('err_file').classList.add('hidden');
    //    document.getElementById('err_fileCount').classList.remove('hidden');
    //} else {
    //    document.getElementById('err_file').classList.add('hidden');
    //    document.getElementById('err_fileCount').classList.add('hidden');
    //}

    if (isError) return;



    var updateRequest = new Object();
    updateRequest.DispositionRecommendationId = caseId;
    updateRequest.IsClassified = isClassifiedInput;
    updateRequest.IsJuvenileJustice = isJuvenileJusticeInput;
    updateRequest.IsCaseAdopted = isCaseAdoptedInput;
    updateRequest.strDateUpdated = new Date().toLocaleString();
    const workItem = getWorkItemType();
    updateRequest.ReferenceItemID = workItem.ItemId;
    updateRequest.ReferenceItemTypeID = workItem.ItemTypeId;
    updateRequest.IsRepresentedByLawyer = isRepresentedByLawyer;
    //updateRequest.SOAHNumber = soahNumber;

    if (filesInput.length > 0) {
        var fileRequest = new FormData();
        for (var i = 0; i < filesInput.length; i++) {
            fileRequest.append('requestFiles', filesInput[i].rawFile)
        }

        $.ajax({
            type: "POST",
            enctype: 'multipart/form-data',
            url: "/Enforcement/UploadEnforcementFiles?uploadReason=" + caseId + " Letter Of Recommendation file upload",
            data: fileRequest,
            processData: false,
            contentType: false,
            cache: false,
            timeout: 600000,
            success: function (result) {

                updateRequest.IsFileUploaded = true;
                updateRequest.Files = result;
                updateRequest.Files.RecordId = caseId;
                updateRequest.Files.RecordType = "LetterOfRepresentation";

                fnUpdateDispositionRecommendation(updateRequest);
            },
            error: function (objError) {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "Error uploading file on " + $("#RecordType").val() }, "error");
            }
        });

    }
    else {
        fnUpdateDispositionRecommendation(updateRequest);
    }
}
function fnUpdateDispositionRecommendation(updateRequest) {
    $.ajax({
        type: "POST",
        url: "/Enforcement/UpdateDispositionRecommendation",
        contentType: "application/json",
        data: JSON.stringify(updateRequest),
        success: function (data) {
            var popupNotification = $("#Notification").data("kendoNotification");
            if (data > 0) {
                //  
                UpdateNDOAttachment(caseId, "CAS", 23);
                popupNotification.show({ message: "Case is updated." }, "success");
                //previewInvCaseOverviewInformation_ReadOnly();
                location.reload();
            }
            else {
                popupNotification.show({ message: "Error updating case." }, "error");
            }
        },
        error: function (objError) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Error updating case." }, "error");
        }
    });
}
function addDisCriminalPenalty() {
    var violations = JSON.parse(JSON.stringify($("#newCriminalViolations").data("kendoGrid").dataSource.data()));
    var violationInput = document.getElementById('dis_ddlCriminalPnyViolationList').value;

    for (var i = 0; i < violations.length; i++) {
        if (violations[i].ViolationId == violationInput) {
            document.getElementById('err_criminalPnyViolationExists').classList.remove('hidden');
            return;
        }
        else
            document.getElementById('err_criminalPnyViolationExists').classList.add('hidden');
    }

    if (violationInput == -1) {
        document.getElementById('err_ddlCriminalPnyViolationList').classList.remove('hidden');
        return;
    } else {
        document.getElementById('err_ddlCriminalPnyViolationList').classList.add('hidden');
    }

    var grid = $("#newCriminalViolations").data("kendoGrid");
    var value = $("#newCriminalViolations").data("kendoGrid").dataSource.data();

    var dispositionViolations = JSON.parse(JSON.stringify($("#dispositionViolationsResult").data("kendoGrid").dataSource.data()));
    var selectedViolation;

    for (var i = 0; i < dispositionViolations.length; i++) {
        if (dispositionViolations[i].ViolationId == violationInput)
            selectedViolation = dispositionViolations[i];
    }

    if (value.length == 0) {
        var dataSource = new kendo.data.DataSource({
            data: [
                {
                    ViolationId: "",
                    Violation: "",
                    ViolationDate: "",
                    Notes: "",
                    CreatedBy: "",
                }
            ],
            pageSize: 5
        });

        dataSource.add({
            ViolationId: selectedViolation.ViolationId,
            Violation: selectedViolation.ViolationSubType,
            ViolationDate: new Date(parseInt(selectedViolation.ViolationDate.substr(6))).toLocaleDateString('en-US'),
            Notes: selectedViolation.Notes,
            CreatedBy: selectedViolation.CreatedBy,
        });

        grid.setDataSource(dataSource);
        $("#newCriminalViolations").data("kendoGrid").refresh();
        document.getElementById('dis_ddlCriminalPnyViolationList').value = -1;
    }
    else {
        grid.dataSource.add({
            ViolationId: selectedViolation.ViolationId,
            Violation: selectedViolation.ViolationSubType,
            ViolationDate: new Date(parseInt(selectedViolation.ViolationDate.substr(6))).toLocaleDateString('en-US'),
            Notes: selectedViolation.Notes,
            CreatedBy: selectedViolation.CreatedBy,
        });
        $("#newCriminalViolations").data("kendoGrid").refresh();
        document.getElementById('dis_ddlCriminalPnyViolationList').value = -1;
    }
}


function createDisCriminalPenalty() {

    var dispositionStatusInput = document.getElementById('dis_ddlDispositionStatus').value;
    var fineInput = document.getElementById('dis_fine').value;
    var dispositionDateInput = document.getElementById('dis_dispositionDate').value;
    var violations = JSON.parse(JSON.stringify($("#newCriminalViolations").data("kendoGrid").dataSource.data()));

    if (dispositionStatusInput == -1) {
        document.getElementById('err_ddlDispositionStatus').classList.remove('hidden');
        return true;
    } else {
        document.getElementById('err_ddlDispositionStatus').classList.add('hidden');
    }

    if (violations.length == 0) return;

    if (dispositionDateInput != "") {
        var dateObj = new Date(dispositionDateInput);
        dispositionDateInput = new Date(dateObj.getTime() + 8 * 6000000);
    }

    var createRequest = new Object();
    createRequest.DispositionRecommendationId = caseId;
    createRequest.Violations = violations;
    createRequest.DispositionStatusId = dispositionStatusInput;
    createRequest.Fine = fineInput;
    createRequest.DispositionDate = dispositionDateInput;
    const workItem = getWorkItemType();
    createRequest.ReferenceItemID = workItem.ItemId;
    createRequest.ReferenceItemTypeID = workItem.ItemTypeId;

    $.ajax({
        type: "POST",
        url: "/Enforcement/CreateDispositionCriminalPenalty",
        contentType: "application/json",
        data: JSON.stringify(createRequest),
        success: function (data) {
            var popupNotification = $("#Notification").data("kendoNotification");
            if (data > 0) {
                popupNotification.show({ message: "Request processed successfully." }, "success");
                resetCreateDisCriminalPenalty();
                loadDispositionCriminalPenalties();
            }
            else
                popupNotification.show({ message: "Error while processing request" }, "error");
        },
        error: function (objError) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Error while processing request" }, "error");
        }
    });
}

function resetCreateDisCriminalPenalty() {
    $("#newCriminalViolations").data("kendoGrid").dataSource.data([]);
    document.getElementById("criminalPenaltiesForm").reset();
    var els = document.getElementsByClassName('field-validation-error');
    Array.prototype.forEach.call(els, function (el) {
        el.classList.add('hidden');
    });
}

function loadDispositionCourtAttachments() {
    backDisCourtAttachment();
    document.getElementById('viewDispositionRecommendationIDCourt').innerHTML = $('#hdnApplicationId').val();
    $.ajax({
        type: "GET",
        url: "/Enforcement/GetDispositionCourtAttachments?dispositionRecommendationId=" + caseId,
        dataType: "json",
        success: function (data) {
            $("#courtAttachmentsResult").empty();
            if (data != null) {
                if (data.length > 0) {
                    $("#courtAttachmentsResult").kendoGrid({
                        toolbar: ["excel"],
                        excel: {
                            fileName: "CriminalCourtAttachments.xlsx",
                            allPages: true
                        },
                        dataSource: {
                            data: data,
                            schema: {
                                model: {
                                    fields: {
                                        CourtAttachmentId: { type: "number" },
                                        CourtNumber: { type: "string" },
                                        DateFiled: { type: "date" },
                                        Place: { type: "string" },
                                        CreatedBy: { type: "string" },
                                    }
                                }
                            },
                            pageSize: 10
                        },
                        groupable: true,
                        scrollable: true,
                        sortable: true,
                        pageable:
                        {
                            pageSizes: true,
                            buttonCount: 3
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
                            { field: "CourtAttachmentId", title: "Id", width: 130, template: "<a href='\\#' class='link' onclick='previewCourtAttachmentDataById(\"#=CourtAttachmentId#\")'>#=CourtAttachmentId#</a>" },
                            { field: "CourtNumber", title: "Court Number", width: 180 },
                            { field: "DateFiled", title: "Date", width: 160, format: "{0:MM/dd/yyyy}" },
                            { field: "Place", title: "Place", width: 160, },
                            { field: "CaseCourtType", title: "Court Type", width: 160, },
                            { field: "CreatedBy", title: "Added by", width: 160, },
                        ]
                    });
                }
                else {
                    if ($('#divNoRecordFoundMessage').length) {
                        disPlayNotExistMessage('No court attachments found on this case."');
                    }
                    //var popupNotification = $("#Notification").data("kendoNotification");
                    //popupNotification.show({ message: "No court attachments found on this case." }, "warning");
                }
            }
            else {
                var popupNotification = $('#Notification').data("kendoNotification");
                popupNotification.show({ message: "No record was found." }, "warning");
            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went wrong. Please try again." }, "error");
        }
    });
}

function loadDispositionCriminalPenalties() {
    backDisCriminalPenalty();
    $.ajax({
        type: "GET",
        url: "/Enforcement/GetDispositionCriminalPenalties?dispositionRecommendationId=" + caseId,
        dataType: "json",
        success: function (data) {
            $("#criminalPenaltiesResult").empty();
            if (data != null) {
                if (data.length > 0) {
                    $("#criminalPenaltiesResult").kendoGrid({
                        toolbar: ["excel"],
                        excel: {
                            fileName: "CriminalPenalties.xlsx",
                            allPages: true
                        },
                        dataSource: {
                            data: data,
                            schema: {
                                model: {
                                    fields: {
                                        CriminalPenaltyId: { type: "number" },
                                        DispositionStatus: { type: "string" },
                                        DispositionDate: { type: "date" },
                                        Fine: { type: "number" },
                                        CreatedBy: { type: "string" },
                                    }
                                }
                            },
                            pageSize: 10
                        },
                        groupable: true,
                        scrollable: true,
                        sortable: true,
                        pageable:
                        {
                            pageSizes: true,
                            buttonCount: 3
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
                            { field: "CriminalPenaltyId", title: "Id", width: 160, template: "<a href='\\#' class='link' onclick='previewCriminalPenaltyDataById(\"#=CriminalPenaltyId#\")'>#=CriminalPenaltyId#</a>" },
                            { field: "DispositionStatus", title: "Status", width: 160 },
                            { field: "DispositionDate", title: "Date", width: 160, format: "{0:MM/dd/yyyy}" },
                            { field: "Fine", title: "Fine", width: 160, },
                            { field: "CreatedBy", title: "Added by", width: 160, },
                        ]
                    });
                }
                else {
                    var popupNotification = $("#Notification").data("kendoNotification");
                    popupNotification.show({ message: "No criminal penalties found on this case." }, "warning");
                }
            }
            else {
                var popupNotification = $('#Notification').data("kendoNotification");
                popupNotification.show({ message: "No record was found." }, "warning");
            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went wrong. Please try again." }, "error");
        }
    });
}

function backDisCriminalPenalty() {
    document.getElementById('criminalPenaltiesResult').classList.remove('hidden');
    document.getElementById('criminalPenaltyView').classList.add('hidden');
}

//Duplicate from Enforcement\EnforcementMenu.js
function hideMobileSidebar() {
    $("body").toggleClass("sidebar-enable");
    $("#sidebarToggle").css("transform", "rotate(180deg)");
}

function EditNotficationContent(e) {

    var templatename = $("#ddlLegalNoticeTemplate option:selected").text();
    var templateId = $("#ddlLegalNoticeTemplate option:selected").val();
    var applicationId = $("#hdnApplicationId").val();
    var workItemId = $("#hdnWorkItemID").val();
    var workItemType = $("#hdnWorkItemTypeID").val();
    var workItemTypeId = $("#hdnWorkItemTypeIDs").val();

    var error = false;

    if (templatename == "" || templatename == "Select") {
        document.getElementById('err_ddlLegalNoticeTemplate').classList.remove('hidden');
        error = true;
    }
    else {
        document.getElementById('err_ddlLegalNoticeTemplate').classList.add('hidden');
    }

    if (error == false) {
        window.location.href = "/Process/EditLegalNoticeNotificationContent?WorkItemTypeId=" + workItemTypeId + "&ApplicationId=" + applicationId + "&WorkItemId=" + workItemId + "&WorkItemType=" + workItemType + "&CaseId=" + applicationId + "&TemplateName=" + templatename + "&TemplateValue=3" + "&ReferringDeptId=8" + "&TemplateId=" + templateId;
    }
    else {
        e.preventDefault()
    }
}
function previewCaseNarrative(caseId) {
    if (caseId == 0)
        return;
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    selectedworkitemType = urlParams.get('WorkitemType');
    selectedworkitemType = selectedworkitemType.replace('_Search', '');
    selectedworkitemType = selectedworkitemType.replace('_Create', '');
    selectedworkitemType = selectedworkitemType.replace('#', '');
    hideMobileSidebar();

    $.ajax({
        type: "GET",
        url: "/Enforcement/GetNarrativeDetails?recordId=" + caseId + "&recTypeId=" + selectedworkitemType,
        contentType: "application/html",
        dataType: "html",
        success: function (results) {
            // hideAllDivs('viewCaseNarrative');
            hideAllPartialViews('viewCaseNarrative');
            $("#viewCaseNarrative").html(results);

        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        },
    });
}

function AddNewSettlement() {
    subjectType = $('#hdnSubjectType').val();
    if ($('#hdnCaseTypeId').val() == 2) {
        var popupNotification = $("#Notification").data("kendoNotification");
        popupNotification.show({ message: "Create settlement not allowed on the Criminal Case." }, "info");
    }
    else if (getViewAccess() == 'Yes') {
        var popupNotification = $("#Notification").data("kendoNotification");
        popupNotification.show({ message: "Allows granted permissions users to create settlements" }, "info");

    }

    else {

        if (subjectType == 'License') {
            $('#dis_ddlAdminSettlementViolationList option').remove();
            $('#dis_ddlAdminSettlementViolationList').append('<option value=-1>Select</option>');
            $.each(violations, function () {
                
                if (this.ViolationStatus === 'Active') {
                    $('#dis_ddlAdminSettlementViolationList').append('<option value=' +
                        this.ViolationId + '>' + this.ViolationSubType + '</option>');
                }
            });
            $("#viewDispositionAdminSettlements").removeClass("hidden");
            $("#screenTitle").text("New Settlement - Admin Case");
        }
        else if (subjectType == 'Person') {
            $('#dis_ddlCriminalSettlementViolationList option').remove();
            $('#dis_ddlCriminalSettlementViolationList').append('<option value=-1>Select</option>');
            $.each(violations, function () {
                $('#dis_ddlCriminalSettlementViolationList').append('<option value=' +
                    this.ViolationId + '>' + this.ViolationSubType + '</option>');
            });
            $("#viewDispositionCriminalSettlements").removeClass("hidden");
            $("#screenTitle").text("New Settlement - Criminal case");
        }
        //     $("#dvSettlementGrid").addClass("hidden");//
        $('#dvSettlementGrid').css('display', 'none');
        $("#dvAddViolations").removeClass("hidden");
        $("#btnAddNewSettlement").addClass("hidden");
    }
}

// Admin
function addDisAdminSettlement() {

    var settlementViolations = JSON.parse(JSON.stringify($("#newAdminSettlementViolations").data("kendoGrid").dataSource.data()));
    var violationInput = document.getElementById('dis_ddlAdminSettlementViolationList').value;

    for (var i = 0; i < settlementViolations.length; i++) {
        if (settlementViolations[i].ViolationId == violationInput) {
            document.getElementById('err_adminSettlementViolationExists').classList.remove('hidden');
            return;
        }
        else
            document.getElementById('err_adminSettlementViolationExists').classList.add('hidden');
    }

    if (violationInput == -1) {
        document.getElementById('err_ddlAdminSettlementViolationList').classList.remove('hidden');
        return;
    } else {
        document.getElementById('err_ddlAdminSettlementViolationList').classList.add('hidden');
    }

    var grid = $("#newAdminSettlementViolations").data("kendoGrid");
    var value = $("#newAdminSettlementViolations").data("kendoGrid").dataSource.data();

    /* var dispositionViolations = JSON.parse(JSON.stringify($("#dispositionViolationsResult").data("kendoGrid").dataSource.data()));*/
    var dispositionViolations = violations; //JSON.parse(JSON.stringify($("#hdnCaseViolations").val()));
    var selectedViolation;

    for (var i = 0; i < dispositionViolations.length; i++) {
        if (dispositionViolations[i].ViolationId == violationInput)
            selectedViolation = dispositionViolations[i];
    }

    if (value.length == 0) {
        var dataSource = new kendo.data.DataSource({
            data: [
                {
                    ViolationId: "",
                    ViolationSubType: "",
                    ViolationDate: "",
                    Notes: "",
                    CreatedBy: "",
                    ViolationTypeId: "",
                    ViolationSubTypeId: "",
                }
            ],
            pageSize: 5
        });

        dataSource.add({
            ViolationId: selectedViolation.ViolationId,
            ViolationSubType: selectedViolation.ViolationSubType,
            ViolationDate: new Date(parseInt(selectedViolation.ViolationDate.substr(6))).toLocaleDateString('en-US'),
            Notes: selectedViolation.Notes,
            CreatedBy: selectedViolation.CreatedBy,
            ViolationTypeId: selectedViolation.ViolationTypeId,
            ViolationSubTypeId: selectedViolation.ViolationSunTypeId,

        });

        grid.setDataSource(dataSource);
        $("#newAdminSettlementViolations").data("kendoGrid").refresh();
        document.getElementById('dis_ddlAdminSettlementViolationList').value = -1;
    }
    else {
        grid.dataSource.add({
            ViolationId: selectedViolation.ViolationId,
            ViolationSubType: selectedViolation.ViolationSubType,
            ViolationDate: new Date(parseInt(selectedViolation.ViolationDate.substr(6))).toLocaleDateString('en-US'),
            Notes: selectedViolation.Notes,
            CreatedBy: selectedViolation.CreatedBy,
            ViolationTypeId: selectedViolation.ViolationTypeId,
            ViolationSubTypeId: selectedViolation.ViolationSunTypeId,
        });
        $("#newAdminSettlementViolations").data("kendoGrid").refresh();
        //document.getElementById('dis_ddlAdminSettlementViolationList').value = -1;
        $('#dis_ddlAdminSettlementViolationList').find(":selected").val(-1);
    }
}
function NextDisAdminSettlementFromDoc(_caseId) {

    /*Start Validations*/
    var isError = false;
    var regex = /^[A-Za-z0-9,. ]+$/;
    var regexnum = /^[0-9]+$/;
    var regexDollor = /(?=.*?\d)^\$ ? (([1 - 9]\d{ 0, 2 } (, \d{ 3 })*)|\d +)?(\.\d{ 1, 2 })?$/;
    var selectedSettlementTypeId = -1;
    var selectedPandaDocTemplateId = "";
    var isLegalSettlement = $('#IsLegalSettlement').val();
    if ($('#dis_ddlAdminSettlementPelalityList').find(":selected").val() == -1) {
        document.getElementById('err_admin_responseAdminPenalityType').classList.remove('hidden');
        isError = true;
    }
    else {
        document.getElementById('err_admin_responseAdminPenalityType').classList.add('hidden');
        selectedSettlementTypeId = $('#dis_ddlAdminSettlementPelalityList').find(":selected").val();
    }

    if ($("#responseDueDate").is(":visible") && $("#dis_responseDueDate").val() == "") {
        document.getElementById('err_admin_responseDue').classList.remove('hidden');
        document.getElementById('err_admin_sameResponseDueValidate').classList.add('hidden');
        isError = true;
    } else {
        document.getElementById('err_admin_responseDue').classList.add('hidden');
    }

    //Warning EGIS-1621
    
    if ($('#dis_ddlAdminSettlementPelalityList').find(":selected").val() === 11) {
        if ($("#warningIssuedDate").is(":visible") && $("#dis_warningIssuedDate").val() == "") {
            document.getElementById('err_admin_warningIssuedDate').classList.remove('hidden');
            //document.getElementById('err_admin_sameResponseDueValidate').classList.add('hidden');
            isError = true;
        } else {
            document.getElementById('err_admin_warningIssuedDate').classList.add('hidden');
        }

        if ($('#dis_ddlissuingDivision').find(":selected").val() == -1) {
            document.getElementById('err_admin_issuingDivision').classList.remove('hidden');
            isError = true;
        }
        else {
            document.getElementById('err_admin_issuingDivision').classList.add('hidden');
            selectedSettlementTypeId = $('#dis_ddlissuingDivision').find(":selected").val();
        }

        if ($('#dis_ddlAdminWarningIssuedBy').find(":selected").val() == -1) {
            document.getElementById('err_admin_WarningIssuedBy').classList.remove('hidden');
            isError = true;
        }
        else {
            document.getElementById('err_admin_WarningIssuedBy').classList.add('hidden');
            selectedSettlementTypeId = $('#dis_ddlAdminWarningIssuedBy').find(":selected").val();
        }
    }

    //


    if ($("#responseFollowUp").is(":visible") && $("#dis_responseFollowUpDate").val() == "") {
        document.getElementById('err_admin_responseFollowup').classList.remove('hidden');
        document.getElementById('err_admin_sameResponseInputFollowUp').classList.add('hidden');
        isError = true;
    } else {
        if (new Date($("#dis_responseFollowUpDate").val()) > new Date($("#dis_responseDueDate").val())) {
            document.getElementById('err_admin_followUpgreaterThanValidate').classList.remove('hidden');
            isError = true;
        } else {
            document.getElementById('err_admin_responseFollowup').classList.add('hidden');
            document.getElementById('err_admin_followUpgreaterThanValidate').classList.add('hidden');
        }
    }



    if ($("#divSuspensionInputs").is(":visible") && $("#dis_SuspensionStartDate").val() == "") {
        document.getElementById('err_admin_responseSuspensionStart').classList.remove('hidden');
        isError = true;
    } else {
        document.getElementById('err_admin_responseSuspensionStart').classList.add('hidden');
    }
    if (($("#divSuspensionInputs").is(":visible") && $("#responseDueDate").is(":visible")) && (new Date($("#dis_responseDueDate").val()) > new Date($("#dis_SuspensionStartDate").val()))) {
        document.getElementById('err_admin_responseDueValidate').classList.remove('hidden');
        document.getElementById('err_admin_sameResponseDueValidate').classList.add('hidden');
        isError = true;
    } else {
        document.getElementById('err_admin_responseDueValidate').classList.add('hidden');
    }

    if (($("#divSuspensionInputs").is(":visible") && $("#responseFollowUp").is(":visible")) && (new Date($("#dis_responseFollowUpDate").val()) > new Date($("#dis_SuspensionStartDate").val()))) {
        document.getElementById('err_admin_responseInputFollowUp').classList.remove('hidden');
        document.getElementById('err_admin_sameResponseInputFollowUp').classList.add('hidden');
        isError = true;
    } else {
        document.getElementById('err_admin_sameResponseInputFollowUp').classList.add('hidden');
    }
    if (($("#divSuspensionInputs").is(":visible") && $("#responseDueDate").is(":visible")) && ($("#dis_responseDueDate").val() != "" && $("#dis_SuspensionStartDate").val() != "")) {
        if ($("#dis_responseDueDate").val() == $("#dis_SuspensionStartDate").val()) {
            document.getElementById('err_admin_sameResponseDueValidate').classList.remove('hidden');
            document.getElementById('err_admin_responseDueValidate').classList.add('hidden');
            isError = true;
        } else {
            document.getElementById('err_admin_sameResponseDueValidate').classList.add('hidden');

        }
    }
    if (($("#divSuspensionInputs").is(":visible") && $("#responseFollowUp").is(":visible")) && ($("#dis_responseFollowUpDate").val() != "" && $("#dis_SuspensionStartDate").val() != "")) {
        if ($("#dis_responseFollowUpDate").val() == $("#dis_SuspensionStartDate").val()) {
            document.getElementById('err_admin_sameResponseInputFollowUp').classList.remove('hidden');
            document.getElementById('err_admin_responseInputFollowUp').classList.add('hidden');
            isError = true;
        } else {
            document.getElementById('err_admin_sameResponseInputFollowUp').classList.add('hidden');
        }
    }
    if ($('#divPenatyInput').is(":visible")) {
        if ($("#inv_penalityAmountEdit").val() == "") {
            document.getElementById('err_admin_responsePenalityAmount').classList.remove('hidden');
            document.getElementById('formatErr_admin_responsePenalityAmountOtherEdit').classList.add('hidden');
            isError = true;
        } else if ($("#inv_penalityAmountEdit").val().replace(/\s+/g, '') == "" || !regex.test($("#inv_penalityAmountEdit").val())) {
            document.getElementById('err_admin_responsePenalityAmount').classList.add('hidden');
            document.getElementById('formatErr_admin_responsePenalityAmountOtherEdit').classList.remove('hidden');
            isError = true;
        } else {
            document.getElementById('err_admin_responsePenalityAmount').classList.add('hidden');
            document.getElementById('formatErr_admin_responsePenalityAmountOtherEdit').classList.add('hidden');
        }

        //EGIS-1918
        if ($("#dis_penaltyResponseDueDate").val() == "") {
            document.getElementById('err_admin_penaltyresponseDue').classList.remove('hidden');
            document.getElementById('err_admin_penaltyresponseDueValidate').classList.add('hidden');
            isError = true;
        } else {
            document.getElementById('err_admin_penaltyresponseDue').classList.add('hidden');
        }
    }

    if (($("#divSuspensionInputs").is(":visible") && $("#divSuspensionDays").is(":visible")) && $("#inv_numSusPensionDaysEdit").val() == "") {
        document.getElementById('err_admin_responseSuspensionDays').classList.remove('hidden');
        document.getElementById('formatErr_admin_suspensionDaysOtherEdit').classList.add('hidden');
        isError = true;
    } else {
        document.getElementById('err_admin_responseSuspensionDays').classList.add('hidden');
        document.getElementById('formatErr_admin_suspensionDaysOtherEdit').classList.add('hidden');
    }
    if (($("#divSuspensionInputs").is(":visible") && $("#divSuspensionDays").is(":visible")) && (ValidateSuspensionStartOverlappingDate($("#dis_SuspensionStartDate").val(), $("#inv_numSusPensionDaysEdit").val(), caseId, 0) !== "")) {
        document.getElementById('err_admin_suspensionOverlappingDateValidate').classList.remove('hidden');
        isError = true;
    } else {
        document.getElementById('err_admin_suspensionOverlappingDateValidate').classList.add('hidden');
    }

    var settlementType = $('#dis_ddlAdminSettlementPelalityList').find(":selected").text();
    var reducedNumberDays = 0;
    var reducedPenaltyAmount = 0;
    var totalPenalty = $('#inv_penalityAmountEdit').val();
    var totalDays = $('#inv_numSusPensionDaysEdit').val();
    var reducedDays = $('#ddl_ReducedNumberOfDays').val();
    reducedPenaltyAmount = $('#inv_ReducedPenaltyAmount').val();

    if (settlementType === "Suspension or Civil Penalty With Education" || settlementType === "Suspension or Civil Penalty with Education and Bond") {
        //ddl_ReducedNumberOfDays
        if (reducedDays !== "" && parseInt(reducedDays) > 0) {
            document.getElementById('err_admin_reduceNumberDays').classList.add('hidden');
            if (parseInt(reducedDays) > parseInt(totalDays)) {
                $('#err_admin_reduceNumberDays').removeClass('hidden');
                isError = true;
            } else {
                reducedNumberDays = reducedDays;
                /*reducedPenaltyAmount = $('#inv_ReducedPenaltyAmount').val();*/
            }
        } else {
            document.getElementById('err_edit_admin_reduceNumberDays').classList.remove('hidden');
            isError = true;
        }

        //EGIS-1918
        if ($("#dis_educationResponseDueDate").val() == "") {
            document.getElementById('err_admin_educationresponseDue').classList.remove('hidden');
            document.getElementById('err_admin_educationresponseDueValidate').classList.add('hidden');
            isError = true;
        } else {
            document.getElementById('err_admin_educationresponseDue').classList.add('hidden');
        }

        if (reducedPenaltyAmount !== "" && parseInt(reducedPenaltyAmount) > 0) {
            document.getElementById('err_edit_admin_reduceNumberDaysthanSettlementDays').classList.add('hidden');
            if (parseInt(reducedPenaltyAmount) > parseInt(totalPenalty)) {
                $('#err_edit_admin_reduceNumberDaysthanSettlementDays').removeClass('hidden');
                isError = true;
            }
        } else {
            document.getElementById('err_edit_admin_reducePenaltyAmount').classList.remove('hidden');
            isError = true;
        }
    }

    caseId = $("#CaseId").val();
    if (!caseId)
        caseId = _caseId;
    var DocumentType = $("#DocumentType").val();
    var SettlementDocumentAction = $("#SettlementDocumentAction").val();
    if (!isError) {
        var model = new Object();
        model.DispositionRecommendationId = caseId;
        model.Violations = adminSettlementViolations;
        model.PenaltyTypeID = $('#dis_ddlAdminSettlementPelalityList').find(":selected").val();
        model.WarningIssuingDivision = $('#dis_ddlissuingDivision').find(":selected").val();//////////
        model.WarningIssuedBy = $('#dis_ddlAdminWarningIssuedBy').find(":selected").val();/////
        model.ResponseDue = $("#dis_responseDueDate").val();
        model.AdminWarningIssuedDate = $("#dis_warningIssuedDate").val();////////
        model.ResponseFollowUp = $("#dis_responseFollowUpDate").val();
        model.MonetaryAmount = $("#inv_penalityAmountEdit").val();
        model.PenaltyResponseDue = $("#dis_penaltyResponseDueDate").val(); //EGIS-1918
        model.SuspensionDays = $("#inv_numSusPensionDaysEdit").val();
        model.SuspensionStart = $("#dis_SuspensionStartDate").val();
        const workItem = getWorkItemType();
        model.ReferenceItemID = workItem.ItemId;
        model.ReferenceItemTypeID = workItem.ItemTypeId;
        model.AdminSettlementId = SettlementId;
        model.IsLegalSettlement = isLegalSettlement;
        model.CaseTypeId = $('#hdnCaseTypeId').val();
        CaseTypeId = $('#hdnCaseTypeId').val();

        model.WorkItemId = $("#hdnWorkItemID").val();
        model.ReducedNumberOfDays = reducedNumberDays;
        model.EducationResponseDue = $("#dis_educationResponseDueDate").val(); //EGIS-1918
        model.ReducedPenaltyAmount = reducedPenaltyAmount;

        
        var validateViolationAssociation = false;
        var validateViolationAssociation = ValidateCaseSettementAssociatedViolations(model.DispositionRecommendationId, model.Violations[0].ViolationId, workItem.Code);

        if (validateViolationAssociation)
            return true;

        

        $.ajax({
            type: "POST",
            url: "/Process/CreateAdminSettlementAsDraft",
            contentType: "application/json",
            data: JSON.stringify(model),
            success: function (data) {
                var popupNotification = $("#Notification").data("kendoNotification");
                if (data) {
                    SettlementId = data;
                    //$("#dvSettlementGrid").addClass("hidden");
                    //$("#dvAddViolations").addClass("hidden");
                    //$("#btnAddNewSettlement").addClass("hidden");
                    //$("#dvAddAdminSettlementView").addClass("hidden");
                    //$("#dvSettlementDocument").removeClass("hidden");
                    //ShowSettlementDocumentSection(SettlementId, caseId, CaseTypeId, DocumentType, SettlementDocumentAction);
                    RenderSettlementPartialView("Field Settlement");
                    SettlementId = 0;
                    popupNotification.show({ message: "Request processed successfully." }, "success");

                }
                else
                    popupNotification.show({ message: "Error while processing request" }, "error");
            },
            error: function (objError) {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "Error while processing request" }, "error");
            }
        });
    }
}

function ShowAndHideDivs() {

    $('#divSettlementDocument input[name="SettlementAgreementLetter"]:checked').each(function () {
        
        if ($(this).val() > 0) {
            $("#dvSettlementDocument").show();
            $("#dvSettlementDocument").removeClass("hidden");
            $("#dvSettlementDocumentHistory").removeClass("hidden");

            $('#chkboxPublicuserview').addClass('hidden');
            //$("#dvEDocGen").addClass("hidden");
            $("#dvCMTemplate").addClass("hidden");
            $("#divPreviewCMTemplate").addClass("hidden");

        }
        else {
            $("#dvSettlementDocument").addClass("hidden");
            $("#dvSettlementDocumentHistory").addClass("hidden");
            $("#dvCMTemplate").removeClass("hidden");
            if ($('#dis_ddlCMTemplateList').val() && $('#dis_ddlCMTemplateList').val() != '' && $('#dis_ddlCMTemplateList').val() != '-1')
                $("#divPreviewCMTemplate").removeClass("hidden");

        }
    });
}



function NextDisAdminSettlement() {
    
    var settlementViolations = JSON.parse(JSON.stringify($("#newAdminSettlementViolations").data("kendoGrid").dataSource.data()));
    adminSettlementViolations = JSON.parse(JSON.stringify($("#newAdminSettlementViolations").data("kendoGrid").dataSource.data()));
    if (settlementViolations == null || settlementViolations.length == 0) {
        document.getElementById('err_newAdminViolations').classList.remove('hidden');
        return;
    }



    $("#dvSettlementGrid").addClass("hidden");
    $("#dvAddViolations").addClass("hidden");
    $("#btnAddNewSettlement").addClass("hidden");
    $("#dvAddLegalAdminSettlementView").addClass("hidden");
    $("#dvAddAdminSettlementView").addClass("hidden");
    $("#dvSettlementDocument").addClass("hidden");
    if ($("#IsLegalSettlement").val() == 'True') {
        $("#dvAddLegalAdminSettlementView").removeClass("hidden");
    }
    else {
        $("#dvAddAdminSettlementView").removeClass("hidden");
    }
    //ShowSettlementDocumentSection(SettlementId, CaseId, CaseTypeId, DocumentType, SettlementDocumentAction)
}

function NavigateToSettlementDocuments(_settlementId, isSendWaiverAction = false) {
    settlementId = _settlementId;
    var isLegalSettlement = $('#IsLegalSettlement').val();
    if (isLegalSettlement === 'True') {
        previewSettlement(true, settlementId, false, isSendWaiverAction);
    } else {
        previewSettlement(false, settlementId, false, isSendWaiverAction);
    }
}
function NavigateToEditSettlement(_settlementId, isLegal = false) {
    settlementId = _settlementId;
    previewSettlement(isLegal, settlementId, true);
}

function NavigateToLegalNotice(_settlementId) {
    settlementId = _settlementId;
    /*previewSettlement(false, settlementId);*/
    $("#viewLegalDispositionRecommendationID").html(caseId);
    hideAllPartialViews('divCreateLegalNoticeDocument');
    $('#lblLegalID').hide();
    $('#lblSettlementID').show();
    $("#viewLegalSettlementID").html(settlementId);
    //divSendNoticeBack
    $('#divSendNoticeBack').show();
}

function backToSettlement() {
    previewSettlement(true);
    //var caseId = $("#hdnApplicationId").val();
    //var settlementId = $("#SettlementId").val();
    //var caseTypeId = $("#hdnCaseTypeId").val();
    //previewSettlementData(settlementId, "Administrative Case", caseId);
}

function ValidateCaseSettlementByLicenseId() {
    var rtndata = '';
    $.ajax({
        type: "GET",
        url: "/Enforcement/ValidateCaseSettlementByLicenseId?licenseId=" + licNumber,
        async: false,
        success: function (data) {
            if (data != null) {
                rtndata = data;
            }
            else {
                rtndata = '';
            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went wrong. Please try again." }, "error");
        },
    });
    return rtndata;
}

function ValidateCaseSettementAssociatedViolations(caseID, violationId, workItemType) {
    var rtndata = false;
    $.ajax({
        type: "GET",
        url: "/Enforcement/ValidateCaseSettementAssociatedViolations?CaseID=" + caseID + "&ViolationID=" + violationId + "&WorkItemType=" + workItemType,
        async: false,
        success: function (data) {
            
            if (data != null && data == "True") {
                rtndata = data;
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "Case violation exists for other settlement type." }, "warning");
            }
            else {
                rtndata = false;
            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went wrong. Please try again." }, "error");
        },
    });
    return rtndata;
}

function createDisAdminSettlementPenalty(_caseId) {
    var isError = false;

    //if (!$("#dvEDocGen").is(":visible") && !$("#dvSettlementDocumentHistory").is(":visible")) {
    //    document.getElementById('err_admin_responseSettlementAgreementLetter').classList.remove('hidden');
    //    isError = true;
    //}
    //else {
    //    document.getElementById('err_admin_responseSettlementAgreementLetter').classList.add('hidden');
    //}

    if (!$("#dvCMTemplate").is(":visible") && !$("#dvSettlementDocumentHistory").is(":visible")) {
        document.getElementById('err_admin_responseSettlementAgreementLetter').classList.remove('hidden');
        isError = true;
    }
    else {
        document.getElementById('err_admin_responseSettlementAgreementLetter').classList.add('hidden');
    }

    if ($("#dvCMTemplate").is(":visible") && $('#dis_ddlCMTemplateList').find(":selected").val() == "-1") {
        document.getElementById('err_admin_responseCMTemplate').classList.remove('hidden');
        isError = true;
    } else {
        document.getElementById('err_admin_responseCMTemplate').classList.add('hidden');
    }

    if ($("#dvSettlementDocumentHistory").is(":visible")) {
        var grid = $("#SettlementDocumentHistoryGrid").data("kendoGrid");
        var dataSource = grid.dataSource;
        var totalRecords = dataSource.total();
        if (totalRecords == 0) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Please upload Settlement Agreement document" }, "error");
            isError = true;
        }
        else {
            arrUploadedFileIDs = JSON.parse(JSON.stringify(dataSource.data()));
        }
    }
    if (isError) {
        return false;
    }
    else {

        caseId = _caseId;// $("#CaseId").val();
        var workItemID = $("#hdnWorkItemID").val();
        var templateName = "";
        var template_Id = "";
        var TempName = "";
        var TemplateContent = "";

        if ($("#dvCMTemplate").is(":visible")) {
            templateName = $("#dis_ddlCMTemplateList option:selected").text();
            template_Id = $("#dis_ddlCMTemplateList").val();
            TempName = templateName.replace("Select", "") + getCurrentDateTime() + ".pdf";
            TemplateContent = document.getElementById("divCMTemplateContent").innerHTML;
        }
        //SaveSelectedTemplateDocument(template_Id, templateName);
        var model = new Object();
        model.DispositionRecommendationId = caseId;
        model.AdminSettlementId = SettlementId;
        //  model.ResponseDue = $("#dis_responseDueDate").val();
        const workItem = getReqWorkItemType();
        model.ReferenceItemID = workItem.ItemId;
        model.ReferenceItemTypeID = workItem.ItemTypeId;
        model.UploadedFiles = arrUploadedFileIDs;
        model.WorkItemId = workItemID;
        model.SelectedTemplateId = template_Id;
        model.SelectedTemplateContent = TemplateContent;
        model.SelectedTemplateFormat = $('#ddl_export').find(":selected").val();
        model.CaseTypeId = $("#hdnCaseTypeId").val();
        model.FileName = TempName;

        const urlParams = new URLSearchParams(window.location.search);
        let workItemTypeId = urlParams.get('WorkitemTypeID');

        model.WorkItemTypeId = workItemTypeId;

        if ($('#IsWaiverOrder').val() === 'true') {
            model.IsWaiverOrder = true;
            model.DocumentNote = "System Generated Waiver Order -" + TempName;
        } else {
            model.IsWaiverOrder = false;
            model.DocumentNote = "System Generated Settlement Letter -" + TempName
        }
        
        /*var validateViolationAssociation = false;
        var validateViolationAssociation = ValidateCaseSettementAssociatedViolations(model.DispositionRecommendationId, model.ViolationId, workItem.Code);
        */
        //model.EDocGenTemplateId = template_Id;
        $.ajax({
            type: "POST",
            url: "/Process/SubmitDispositionAdminSettlement",
            contentType: "application/json",
            data: JSON.stringify(model),
            success: function (data) {
                var popupNotification = $("#Notification").data("kendoNotification");
                if (data) {
                    popupNotification.show({ message: "Request processed successfully." }, "success");

                    //update fields
                    //updateDisAdminSettlementPenalty
                    RenderSettlementPartialView("Field Settlement");
                    SettlementId = 0;
                    var isLegalSettlement = $('#IsLegalSettlement').val();
                    if (isLegalSettlement === "True") {
                        previewSettlement(true);
                    }
                }
                else
                    popupNotification.show({ message: "Error while processing request" }, "error");
            },
            error: function (objError) {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "Error while processing request" }, "error");
            }
        });
    }
}

function backToAdminViolationsFromEdit() {
    $('#dvAddAdminSettlementView').addClass("hidden");
    $("#dvAddViolations").removeClass("hidden");
    $('#viewDispositionAdminSettlements').removeClass("hidden");
}


function backToAdminSettlementViewFromEdit() {
    RenderSettlementPartialView("Field Settlement");
    //$('#dvAddAdminSettlementView').removeClass("hidden");
    //$("#dvAddViolations").addClass("hidden");
    //$('#dvSettlementDocument').addClass("hidden");
    //$('#dvSettlementDocumentSelection').addClass("hidden");
    //$('#dvSettlementDocumentSubmitBtn').addClass("hidden");
    //$('#viewDispositionAdminSettlements').addClass("hidden");
}

//Criminal

function addDisCriminalSettlement() {

    var settlementViolations = JSON.parse(JSON.stringify($("#newCriminalSettlementViolations").data("kendoGrid").dataSource.data()));
    var violationInput = document.getElementById('dis_ddlCriminalSettlementViolationList').value;

    for (var i = 0; i < settlementViolations.length; i++) {
        if (settlementViolations[i].ViolationId == violationInput) {
            document.getElementById('err_criminalSettlementViolationExists').classList.remove('hidden');
            return;
        }
        else
            document.getElementById('err_criminalSettlementViolationExists').classList.add('hidden');
    }

    if (violationInput == -1) {
        document.getElementById('err_ddlCriminalSettlementViolationList').classList.remove('hidden');
        return;
    } else {
        document.getElementById('err_ddlCriminalSettlementViolationList').classList.add('hidden');
    }

    var grid = $("#newCriminalSettlementViolations").data("kendoGrid");
    var value = $("#newCriminalSettlementViolations").data("kendoGrid").dataSource.data();

    /* var dispositionViolations = JSON.parse(JSON.stringify($("#dispositionViolationsResult").data("kendoGrid").dataSource.data()));*/
    var dispositionViolations = violations; //JSON.parse(JSON.stringify($("#hdnCaseViolations").val()));
    var selectedViolation;

    for (var i = 0; i < dispositionViolations.length; i++) {
        if (dispositionViolations[i].ViolationId == violationInput)
            selectedViolation = dispositionViolations[i];
    }

    if (value.length == 0) {
        var dataSource = new kendo.data.DataSource({
            data: [
                {
                    ViolationId: "",
                    ViolationSubType: "",
                    ViolationDate: "",
                    Notes: "",
                    CreatedBy: "",
                    ViolationTypeId: "",
                    ViolationSubTypeId: "",
                }
            ],
            pageSize: 5
        });

        dataSource.add({
            ViolationId: selectedViolation.ViolationId,
            ViolationSubType: selectedViolation.ViolationSubType,
            ViolationDate: new Date(parseInt(selectedViolation.ViolationDate.substr(6))).toLocaleDateString('en-US'),
            Notes: selectedViolation.Notes,
            CreatedBy: selectedViolation.CreatedBy,
            ViolationTypeId: selectedViolation.ViolationTypeId,
            ViolationSubTypeId: selectedViolation.ViolationSunTypeId,

        });

        grid.setDataSource(dataSource);
        $("#newCriminalSettlementViolations").data("kendoGrid").refresh();
        document.getElementById('dis_ddlCriminalSettlementViolationList').value = -1;
    }
    else {
        grid.dataSource.add({
            ViolationId: selectedViolation.ViolationId,
            ViolationSubType: selectedViolation.ViolationSubType,
            ViolationDate: new Date(parseInt(selectedViolation.ViolationDate.substr(6))).toLocaleDateString('en-US'),
            Notes: selectedViolation.Notes,
            CreatedBy: selectedViolation.CreatedBy,
            ViolationTypeId: selectedViolation.ViolationTypeId,
            ViolationSubTypeId: selectedViolation.ViolationSunTypeId,
        });
        $("#newCriminalSettlementViolations").data("kendoGrid").refresh();
        // document.getElementById('dis_ddlCriminalSettlementViolationList').value = -1;
        $('#dis_ddlCriminalSettlementViolationList').find(":selected").val(-1);
    }
}
function NextDisCriminalSettlement() {

    //
    var settlementViolations = JSON.parse(JSON.stringify($("#newCriminalSettlementViolations").data("kendoGrid").dataSource.data()));
    criminalSettlementViolations = JSON.parse(JSON.stringify($("#newCriminalSettlementViolations").data("kendoGrid").dataSource.data()));
    if (settlementViolations == null || settlementViolations.length == 0) {
        document.getElementById('err_newCriminalViolations').classList.remove('hidden');
        return;
    }
    else {
        var els = document.getElementsByClassName('field-validation-error');
        Array.prototype.forEach.call(els, function (el) {
            el.classList.add('hidden');
        });
    }
    $("#dvSettlementGrid").addClass("hidden");
    $("#dvAddViolations").addClass("hidden");
    $("#btnAddNewSettlement").addClass("hidden");
    $("#dvAddCriminalSettlementView").removeClass("hidden");
}

function createDisCriminalSettlementPenalty() {
    /*Start Validations*/
    var isError = false;
    var regex = /^[A-Za-z0-9,. ]+$/;
    var regexnum = /^[0-9]+$/;
    var regexDollor = /(?=.*?\d)^\$ ? (([1 - 9]\d{ 0, 2 } (, \d{ 3 })*)|\d +)?(\.\d{ 1, 2 })?$/;

    if ($("#dis_CriminalPenaltyResponseDue").val() == "") {
        document.getElementById('err_criminal_responseDueDate').classList.remove('hidden');
        isError = true;
    } else {
        document.getElementById('err_criminal_responseDueDate').classList.add('hidden');
    }

    if ($('#dis_ddlCriminalSettlementPelalityList').find(":selected").val() == -1) {
        document.getElementById('err_criminal_responsePenalityType').classList.remove('hidden');
        isError = true;
    }
    else {
        document.getElementById('err_criminal_responsePenalityType').classList.add('hidden');
    }


    if ($("#inv_CriminalPenalityAmountEdit").val() == "") {
        document.getElementById('err_criminal_penalityAmount').classList.remove('hidden');
        document.getElementById('formatErr_criminal_penalityAmountOtherEdit').classList.add('hidden');
        isError = true;
    } else if ($("#inv_CriminalPenalityAmountEdit").val().replace(/\s+/g, '') == "" || !regex.test($("#inv_CriminalPenalityAmountEdit").val())) {
        document.getElementById('err_criminal_penalityAmount').classList.add('hidden');
        document.getElementById('formatErr_criminal_penalityAmountOtherEdit').classList.remove('hidden');
        isError = true;
    } else {
        document.getElementById('err_criminal_penalityAmount').classList.add('hidden');
        document.getElementById('formatErr_criminal_penalityAmountOtherEdit').classList.add('hidden');

    }

    if ($("#dis_CriminalPenaltyResponseFollowup").val() == "") {
        document.getElementById('err_criminal_responseFollowup').classList.remove('hidden');
        isError = true;
    }
    else if (new Date($("#dis_CriminalPenaltyResponseFollowup").val()) > new Date($("#dis_CriminalPenaltyResponseDue").val())) {
        document.getElementById('err_criminal_followUpgreaterThanValidate').classList.remove('hidden');
        isError = true;
    }
    else {
        document.getElementById('err_criminal_responseFollowup').classList.add('hidden');
    }
    if (isError) return;

    /*End validations*/
    var model = new Object();
    model.DispositionRecommendationId = caseId;
    model.Violations = criminalSettlementViolations;
    model.ResponseDueDate = $("#dis_CriminalPenaltyResponseDue").val();
    model.PenaltyTypeID = $('#dis_ddlCriminalSettlementPelalityList').find(":selected").val();
    model.DollorAmount = $("#inv_CriminalPenalityAmountEdit").val();
    model.ResponseFollowUpDate = $("#dis_CriminalPenaltyResponseFollowup").val();

    const workItem = getWorkItemType();
    model.ReferenceItemID = workItem.ItemId;
    model.ReferenceItemTypeID = workItem.ItemTypeId;

    $.ajax({
        type: "POST",
        url: "/Process/CreateCriminalSettlement",
        contentType: "application/json",
        data: JSON.stringify(model),
        success: function (data) {
            var popupNotification = $("#Notification").data("kendoNotification");
            if (data) {
                popupNotification.show({ message: "Request processed successfully." }, "success");
                resetCreateDisCriminalSettlementPenalty();
                previewSettlementByCaseId(caseId);
            }
            else
                popupNotification.show({ message: "Error while processing request" }, "error");
        },
        error: function (objError) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Error while processing request" }, "error");
        }
    });

}

function resetCreateDisCriminalSettlementPenalty() {

    $("#newCriminalSettlementViolations").data("kendoGrid").dataSource.data([]);
    document.getElementById("AddCriminalSettlementForm").reset();
    document.getElementById("criminalSettlementsForm").reset();
    $("#screenTitle").text("Settlement & Waiver Agreements");
    var els = document.getElementsByClassName('field-validation-error');
    Array.prototype.forEach.call(els, function (el) {
        el.classList.add('hidden');
    });

    $("#dvSettlementGrid").removeClass("hidden");
    $("#dvAddViolations").addClass("hidden");
    $("#btnAddNewSettlement").removeClass("hidden");
    $("#dvAddCriminalSettlementView").addClass("hidden");

}
function resetCreateDisAdminSettlementPenalty() {

    $("#newAdminSettlementViolations").data("kendoGrid").dataSource.data([]);
    document.getElementById("AddAdminSettlementForm").reset();
    document.getElementById("adminSettlementForm").reset();
    $("#screenTitle").text("Settlement & Waiver Agreements");
    var els = document.getElementsByClassName('field-validation-error');
    Array.prototype.forEach.call(els, function (el) {
        el.classList.add('hidden');
    });

    $("#dvSettlementGrid").removeClass("hidden");
    $("#dvAddViolations").addClass("hidden");
    $("#btnAddNewSettlement").removeClass("hidden");
    $("#dvAddAdminSettlementView").addClass("hidden");
}

function backToCriminalViolationsFromEdit() {
    $('#dvAddCriminalSettlementView').addClass("hidden");
    $('#viewDispositionCriminalSettlements').removeClass("hidden");
    $("#dvAddViolations").removeClass("hidden");
}

function previewSettlementByCaseId(id, isLegal = false) {

    caseId = id;
    $.ajax({
        type: "GET",
        url: "/Enforcement/GetSettlementByCaseId?caseId=" + id + "&isLegal=" + isLegal,
        dataType: "json",
        success: function (data) {
            
            if (data != null) {
                //  $("#dvSettlementGrid").removeClass("hidden");
                if (data.length == 0) {
                    $("#dvSettlementGrid").append("No records Found.");
                    return;
                }
                $("#dvSettlementGrid").kendoGrid({
                    toolbar: ["excel"],
                    excel: {
                        fileName: "Settlement Data_Case# " + id + ".xlsx",
                        allPages: true
                    },
                    dataSource: {
                        data: data,
                        schema: {
                            model: {
                                fields: {
                                    SettlementId: { type: "number" },
                                    //ResponseStatus: { type: "string" },
                                    SettlementType: { type: "string" },
                                    strResponseDue: { type: "string" },
                                    strResponseFollowup: { type: "string" },
                                    SuspensionServedDate: { type: "date" },
                                    CreatedBy: { type: "string" },
                                    CaseType: { type: "string" },
                                    StrSettlementAction: { type: "string" },
                                    SettlementStatus: { type: "string" },
                                }
                            }
                        },
                        pageSize: 10
                    },
                    groupable: true,
                    scrollable: true,
                    sortable: true,
                    pageable:
                    {
                        pageSizes: true,
                        buttonCount: 3
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
                        { field: "SettlementId", title: "Id", width: 120, template: "<a href='\\#' class='link' onclick='previewSettlementData(\"#=SettlementId#\",\"#=CaseType#\"," + id + ")'>#=SettlementId#</a>" },
                        //{ field: "ResponseStatus", title: "Status", width: 180 },
                        { field: "SettlementType", title: "Type", width: 220 },
                        { field: "strResponseDue", title: "Due", width: 150, format: "{0:MM/dd/yyyy}" },
                        { field: "strResponseFollowup", title: "Follow Up", width: 150, format: "{0:MM/dd/yyyy}" },
                        { field: "SuspensionServedDate", title: "Added by", width: 150, format: "{0:MM/dd/yyyy}" },
                        { field: "CaseType", title: "CaseType", width: 160, hidden: true },
                        { field: "StrSettlementAction", title: "Last Action", width: 160, hidden: true },
                        { field: "SettlementStatus", title: "Status", width: 160 },
                        {
                            title: "Actions", width: 100, template: function (dataItem) {
                                let actionTemplate = '';
                                if (dataItem.SettlementStatus === 'Draft' && getClosedCaseValue() != 'Yes') {
                                    actionTemplate += '<a role="button" class="k-button k-button-icontext k-grid-delete" href="javascript:void(0);" onclick="removeSettlement(' + dataItem.SettlementId + ')"><span class="k-icon k-i-close"></span> </a>';
                                }
                                return actionTemplate;
                            }
                        }
                    ]
                });
            }
            else {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "No settlement found of this case." }, "warning");
            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went wrong. Please try again." }, "error");
        }
    });
}

function IsDraft(status) {
    if (status === 'Draft') {
        return false;
    } else {
        return true;
    }
}

function removeSettlement(idInput) {

    event.stopPropagation();
    var result = confirm('Are you sure, you want to delete?');
    if (result == false) {
        return false;
    }
    var removeRequest = new Object();
    removeRequest.SettlementId = idInput;

    $.ajax({
        type: "POST",
        url: "/Enforcement/RemoveAdminSettlement",
        contentType: "application/json",
        data: JSON.stringify(removeRequest),
        success: function (data) {
            hideViewAscData();
            var popupNotification = $("#Notification").data("kendoNotification");
            if (data) {
                popupNotification.show({ message: "Settlement removed successfully." }, "success");
                var isLegalSettlement = $('#IsLegalSettlement').val();
                if (isLegalSettlement === "True") {
                    previewSettlement(true);
                } else {
                    previewSettlementByCaseId($('#Case_Id').val());
                }
            }
            else {
                popupNotification.show({ message: "Error in removing Settlement." }, "warning");
            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        },
    });
}

function previewSettlementData(id, caseType, caseId) {
    
    $.ajax({
        type: "GET",
        url: "/Enforcement/GetSettelmentDetailsById?settlementId=" + id + "&caseType=" + caseType + "&caseId=" + caseId,
        contentType: "application/html",
        dataType: "html",
        success: function (data) {
            
            if (data != null) {
                //hideAllDivs('dvSettlement');
                $("#dvSettlement").html(data);
                $("#divCreateLegalNoticeDocument").addClass("hidden");
                $("#dvMainSettelementView").addClass("hidden");
                $("#dvSettlement").removeClass("hidden");


            }
            else {
                var popupNotification = $('#Notification').data("kendoNotification");
                popupNotification.show({ message: "No record was found." }, "warning");
            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went wrong. Please try again." }, "error");
        }
    });
}


function removeAdminViolation(args) {
    var tr = $(args).closest("tr");
    var grid = $("#newAdminSettlementViolations").data("kendoGrid");
    grid.removeRow(tr);
    grid.refresh();

}

function removeCriminalViolation(args) {
    var tr = $(args).closest("tr");
    var grid = $("#newCriminalSettlementViolations").data("kendoGrid");
    grid.removeRow(tr);
    grid.refresh();

}


//Allow only numeric and decimal
function isNumberKey(evt, obj) {

    var charCode = (evt.which) ? evt.which : event.keyCode
    var value = obj.value;
    var dotcontains = value.indexOf(".") != -1;
    if (dotcontains)
        if (charCode == 46) return false;
    if (charCode == 46) return true;
    if (charCode > 31 && (charCode < 48 || charCode > 57))
        return false;
    return true;
}

//Aloow only 2 decimal
var validate = function (e) {
    var t = e.value;
    e.value = (t.indexOf(".") >= 0) ? (t.substr(0, t.indexOf(".")) + t.substr(t.indexOf("."), 3)) : t;
}

//Allow only numeric
function isNumber(evt) {
    evt = (evt) ? evt : window.event;

    var charCode = (evt.which) ? evt.which : evt.keyCode;

    if (charCode > 31 && (charCode < 48 || charCode > 57)) {

        return false;
    }
    return true;

}
function redirectToCreateViolation() {
    document.getElementById('viewViolationTitle').innerHTML = 'Add Violation';
    document.getElementById('violations_add').classList.remove('hidden');
    document.getElementById('violations_view').classList.add('hidden');
    registerViolationEvents();
    document.getElementById("violationsForm").reset();
    document.getElementById('inv_adminViolationList').classList.add('hidden');
}

function enableViolationConditionalFields(value) {
    var subjectOptions = document.getElementById('inv_ddlAssociationList').options;
    var subjectInputText = "";
    for (var i = 0; i < subjectOptions.length; i++) {
        if (subjectOptions[i].value == value)
            subjectInputText = subjectOptions[i].text;
    }
    subjectType = subjectInputText.split('-')[0].trim();

    if (subjectType == 'License') {
        document.getElementById('inv_adminViolationList').classList.remove('hidden');
        document.getElementById('inv_criminalViolationList').classList.add('hidden');
        document.getElementById('inv_ddlAdminViolationList').value = "Select";

    }
    else if (subjectType == 'Person') {
        document.getElementById('inv_adminViolationList').classList.add('hidden');
        document.getElementById('inv_criminalViolationList').classList.remove('hidden');
        document.getElementById('inv_ddlCriminalViolationList').value = "Select";

    }
}

//Function renamed from getViolationAssociationLists to getViolationAssociations, 
//as we have function with same name at other file.
function getViolationAssociations(InvestigationId) {
    const urlParam = new URLSearchParams(window.location.search.toLowerCase());
    let workItemTyp = urlParam.get('workitemtypeid');
    if (!workItemTyp)
        workItemTyp = urlParam.get('workitemtype');
    let ApplicationID = urlParam.get('applicationid');
    const workItem = getWorkItemType();
    $.ajax({
        type: "GET",
        url: "/Enforcement/GetInvAssociations?itemTypeId=" + workItem.ItemTypeId + "&itemId=" + workItem.ItemId + "&workItemId=" + workItem.Workitem_Id,
        dataType: "json",
        contentType: "application/json",
        success: function (data) {
            if (data != null) {

                const urlParams = new URLSearchParams(window.location.search);
                let workItemType = urlParams.get('workitemTypeId');
                if (!workItemType)
                    workItemType = urlParams.get('WorkitemType');

                $('#inv_ddlAssociationList option').remove();
                $('#inv_ddlAssociationList').append('<option value=-1>Select</option>');

                $.each(data, function () {
                    if ($("#hdnCaseTypeId").val() == 1) {
                        if (this.AssociationRecordType == 'License' || this.AssociationRecordType == null) {
                            $('#inv_ddlAssociationList').append('<option value=' +
                                this.AssociationRecordID + '>' + this.AssociationRecordIdentifier + '</option>');
                        }
                    }
                    else if ($("#hdnCaseTypeId").val() == 2) {
                        if (this.AssociationRecordType == 'Person' || this.AssociationRecordType == null) {
                            $('#inv_ddlAssociationList').append('<option value=' +
                                this.AssociationRecordID + '>' + this.AssociationRecordIdentifier + '</option>');
                        }
                    }
                    else {
                        if (((this.AssociationRecordType == 'Person') && (workItemType != 'LEG')) || this.AssociationRecordType == 'License' || this.AssociationRecordType == null) {
                            $('#inv_ddlAssociationList').append('<option value=' +
                                this.AssociationRecordID + '>' + this.AssociationRecordIdentifier + '</option>');
                        }
                    }

                });
            }
            else {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "No record was found." }, "warning");
            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        },
    });
}


function loadAdminViolationDropdown() {
    var ddlAData = $("#inv_ddlAdminViolationList").data("kendoDropDownList");
    ddlAData.setDataSource(adminViolations);
    ddlAData.dataSource.read();
    //ddlAData.select(0);
}
function loadCriminalViolationDropdown() {
    var ddlCData = $("#inv_ddlCriminalViolationList").data("kendoDropDownList");
    ddlCData.setDataSource(criminalViolations);
    ddlCData.dataSource.read();
    ddlCData.select(0);
}

function validateViolationInput(columnViolationData, ViolationSubType, strViolationDate) {
    // Check if the Violation with the same ViolationSubType and strViolationDate already exists in the array
    //return employees.some(function (employee) {
    //    return employee.id === employeeId && employee.name === employeeName;
    //});
    //debugger
    //var existingViolationDate = new Date(_violationDate);
    //var newViolationDate = new Date(strViolationDate);
    //// Convert both dates to UTC to ensure accurate comparison
    //var utcDate1 = new Date(Date.UTC(existingViolationDate.getFullYear(), existingViolationDate.getMonth(), existingViolationDate.getDate()));
    //var utcDate2 = new Date(Date.UTC(newViolationDate.getFullYear(), newViolationDate.getMonth(), newViolationDate.getDate()));



    //if (_violationSubType == ViolationSubType)
    //{// && (utcDate1.getTime() === utcDate2.getTime())) {
    //    return false
    //}
    //else {
    for (var i = 0; i < columnViolationData.length; i++) {
        var violation = columnViolationData[i];
        // Check if employee matches the given id and name
        if (violation.ViolationSubType == ViolationSubType && violation.strViolationDate == strViolationDate) {
            return true; // Employee found
        }
    }
    //}
    //if (columnViolationData.some(violation))
    //{
    //    if(violation.ViolationSubType == ViolationSubType && violation.strViolationDate == strViolationDate) { return true; }
    //    else { return false; }
    //}
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

function saveInvestigationViolation() {
    debugger
    const workItem = getWorkItemType();
    if (workItem.ItemId == 0) return;

    var workItemId = -1;
    if ($('#hdnWorkItemID').length) {
        workItemId = $("#hdnWorkItemID").val();
    }


    var isError = false;
    var regex = /^[a-zA-Z0-9 .?!,-]*$/;
    var subjectInput = document.getElementById('inv_ddlAssociationList').value;
    var violationTypeInput = document.getElementById('inv_ddlViolationTypes').value;
    var columnData = [];

    //var columnViolationData = [];
    //=======

    //if ($("#dispositionViolationsResult").data("kendoGrid") !== undefined) {
    //    var data = $("#dispositionViolationsResult").data("kendoGrid").dataSource._data;
    //    for (i = 0; i < data.length; i++) {
    //        if (typeof data[i]["ViolationSubType"] !== "undefined") {
    //            if (!columnData.includes(data[i]["ViolationSubType"])) {
    //                columnData.push(data[i]["ViolationSubType"]);
    //            }
    //        }
    //    }
    //}

    //if ($("#dispositionViolationsResult").data("kendoGrid") !== undefined) {
    //    var data = $("#dispositionViolationsResult").data("kendoGrid").dataSource._data;
    //    for (i = 0; i < data.length; i++) {
    //        if (typeof data[i]["ViolationSubType"] !== "undefined" && typeof data[i]["strViolationDate"] !== "undefined") {
    //            //if (!columnViolationData.includes(data[i]["ViolationSubType"])) {
    //            if (!columnViolationData.includes(data[i]["ViolationSubType"] && data[i]["strViolationDate"])) {

    //                columnViolationData.push({ ViolationSubType: data[i]["ViolationSubType"], strViolationDate: data[i]["strViolationDate"] });
    //            }
    //        }
    //    }
    //}

    //=======
    if (subjectType == 'License') {
        var adminViolationInput = document.getElementById('inv_ddlAdminViolationList').value;
        var adminViolationInputVal = $('#inv_ddlAdminViolationList').data("kendoDropDownList").text();
    }
    if (subjectType == 'Person') {
        var criminalViolationInput = document.getElementById('inv_ddlCriminalViolationList').value;
        var criminalViolationInputVal = $('#inv_ddlCriminalViolationList').data("kendoDropDownList").text();
    }

    
    var violationDateInput = document.getElementById('inv_violationDate').value;
    if (violationDateInput == "") {
        document.getElementById('err_violationDate').classList.remove('hidden');
        isError = true;
    } else {
        document.getElementById('err_violationDate').classList.add('hidden');
    }
    //Check invalid date / key entry
    if (!isValidDateTimeFormat(violationDateInput)) {
        document.getElementById('Err_violationDateInvalidInput').classList.remove('hidden');
        const invErr_invalidstartDate = document.getElementById('Err_violationDateInvalidInput');
        invErr_invalidstartDate.style.display = '';
        isError = true;
    }
    else {
        document.getElementById('Err_violationDateInvalidInput').classList.add('hidden');
    }

    var currentDate = new Date();
    //Check invalid date / key entry

    const inputDate = new Date(violationDateInput);
    if (inputDate > currentDate) {
        document.getElementById('Err_ftDate').classList.remove('hidden');
        isError = true;
    }
    else if (inputDate == currentDate) {
        if (new Date(inputDate).getTime() > currentDate.getTime()) {
            document.getElementById('Err_ftDate').classList.remove('hidden');
            isError = true;
        }
        else {
            document.getElementById('Err_ftDate').classList.add('hidden');
        }
    }
    else {
        document.getElementById('Err_ftDate').classList.add('hidden');
    }

    var notesInput = document.getElementById('inv_caseviolationDetails').value;
    notesInput = sanitizeHtml(notesInput);
    notesInput = removeSpecialCharacters(notesInput);


    if (subjectInput == -1) {
        document.getElementById('err_ddlInvAssociationList').classList.remove('hidden');
        isError = true;
    } else {
        document.getElementById('err_ddlInvAssociationList').classList.add('hidden');
    }


    var violationInput = 0, violationInputVal = "";;
    if (subjectType == 'License') {
        if (adminViolationInput == -1 || adminViolationInput == 'Select' || adminViolationInput == undefined) {
            document.getElementById('err_ddlInvAdminViolationList').classList.remove('hidden');
            isError = true;
        } else if (typeof adminViolationInput == "undefined") {
            violationInput = adminViolationInput;
            violationInputVal = adminViolationInputVal;
            document.getElementById('err_ddlInvAdminViolationList').classList.add('hidden');
        }
        else {
            violationInput = adminViolationInput;
            violationInputVal = adminViolationInputVal;
            document.getElementById('err_ddlInvAdminViolationList').classList.add('hidden');
        }
    }
    else if (subjectType == 'Person') {
        if (criminalViolationInput == -1 || criminalViolationInput == 'Select' || criminalViolationInput == undefined) {
            document.getElementById('err_ddlInvCriminalViolationList').classList.remove('hidden');
            isError = true;
        } else if (typeof criminalViolationInput == "undefined") {
            violationInput = criminalViolationInput;
            violationInputVal = criminalViolationInputVal;
            document.getElementById('err_ddlInvCriminalViolationList').classList.add('hidden');
        }
        else {
            violationInput = criminalViolationInput;
            violationInputVal = criminalViolationInputVal;
            document.getElementById('err_ddlInvCriminalViolationList').classList.add('hidden');
        }
    }

    if (notesInput == "") {
        if (workItem.Code != 'LEG') {
            document.getElementById('err_invViolationDetails').classList.remove('hidden');
            document.getElementById('formatErr_invViolationDetails').classList.add('hidden');
            isError = true;
        }
    } else if (notesInput.replace(/\s+/g, '') == "") {

        document.getElementById('err_invViolationDetails').classList.add('hidden');
        document.getElementById('formatErr_invViolationDetails').classList.remove('hidden');
        isError = true;
    } else {
        document.getElementById('err_invViolationDetails').classList.add('hidden');
        document.getElementById('formatErr_invViolationDetails').classList.add('hidden');
    }
    
    //if ((violationInput != 0 && violationInputVal != "")
    //{
    ////&& columnData.includes(violationInputVal)) {
    ////if ((violationInput != 0 && violationInputVal != "") && validateViolationInput(columnViolationData, violationInputVal, violationDateInput)) { 
    //    isError = true;
    //    if (subjectType == 'Person' || subjectType == 'Location') {
    //        document.getElementById('err_ddlAdminViolationListExist').classList.add('hidden');
    //        document.getElementById('err_ddlCriminalViolationListExist').classList.remove('hidden');
    //    } else if (subjectType == 'License') {
    //        document.getElementById('err_ddlCriminalViolationListExist').classList.add('hidden');
    //        document.getElementById('err_ddlAdminViolationListExist').classList.remove('hidden');
    //    }
    //} else {
    //    document.getElementById('err_ddlAdminViolationListExist').classList.add('hidden');
    //    document.getElementById('err_ddlCriminalViolationListExist').classList.add('hidden');
    //}

    if (isError) return;

    var recordType = 'CAS - Recommendation'
    if (workItem.Code == 'LEG') {
        recordType = 'LEG - Recommendation'
    }
    var addRequest = new Object();
    addRequest.RecordId = workItem.ItemId;
    addRequest.RecordType = 'CAS - Recommendation';
    addRequest.ViolationTypeId = violationTypeInput;
    addRequest.ViolationSubTypeId = violationInput;
    addRequest.SubjectId = subjectInput;
    addRequest.SubjectType = subjectType;
    addRequest.ViolationDate = violationDateInput;
    addRequest.Notes = notesInput;
    addRequest.ReferenceItemID = workItem.ItemId;
    addRequest.ReferenceItemTypeID = workItem.ItemTypeId;
    addRequest.WorkItemId = workItemId;

    $.ajax({
        url: '/Apps/CheckUserSession',
        type: 'GET',
        success: function (response) {
            if (response === "False" || response === "false" || response === false) {
                alert("Session timed out. Please log in again.");
                window.location.href = "/Apps/LogOff";
            }
            else {
                $.ajax({
                    type: "POST",
                    url: "/Enforcement/AddViolationToInvestigation",
                    contentType: "application/json",
                    data: JSON.stringify(addRequest),
                    success: function (result) {

                        var popupNotification = $("#Notification").data("kendoNotification");
                        if (result == "True") {
                            popupNotification.show({ message: "Added violation to Case WorkItem." }, "success");
                            document.getElementById('violationsForm').reset();
                            document.getElementById('inv_adminViolationList').classList.add('hidden');
                            document.getElementById('inv_criminalViolationList').classList.add('hidden');
                            previewCaseViolations();
                            $("#inv_ddlAdminViolationList").data("kendoDropDownList").refresh();
                            $("#inv_ddlCriminalViolationList").data("kendoDropDownList").refresh();
                        }
                        else {
                            /*popupNotification.show({ message: "Error adding violation to investigation." }, "error");*/
                            popupNotification.show({ message: "Violation to investigation already exists." }, "error");
                            $("#inv_ddlAdminViolationList").data("kendoDropDownList").refresh();
                            $("#inv_ddlCriminalViolationList").data("kendoDropDownList").refresh();
                        }
                    },
                    error: function (objError) {

                        var popupNotification = $("#Notification").data("kendoNotification");
                        popupNotification.show({ message: "Error adding violation on investigation." }, "error");
                        $("#inv_ddlAdminViolationList").data("kendoDropDownList").refresh();
                        $("#inv_ddlCriminalViolationList").data("kendoDropDownList").refresh();
                    }
                });
            }
        },
    });
    
    backtoAllegations();
}

function isValidDateTimeFormat(value) {
    const date = new Date(value);
    return date.toString() !== "Invalid Date" && date.toISOString() === new Date(date.toISOString()).toISOString();
}

function backtoAllegations() {
    if (document.getElementById('addAllegationAssociations')) {
        document.getElementById('addAllegationAssociations').classList.remove('hidden');
    }
    $('#inv_caseviolationDetails').data('kendoEditor').value(null);
    document.getElementById('viewViolationTitle').innerHTML = 'Violations';
    document.getElementById('violations_add').classList.add('hidden');
    document.getElementById('violations_view').classList.remove('hidden');
}

function SettlementCheck(id) {
    caseId = id;
    var workItemType = $("#hdnWorkItemTypeID").val();
    $.ajax({
        type: "GET",
        url: "/Enforcement/GetSettlementByCaseId?caseId=" + id,
        dataType: "json",
        success: function (data) {
            if (data != null) {
                $.each(data, function () {

                    if (this.RequestId > 0) {
                        var grid = $("#dispositionViolationsResult").data("kendoGrid");
                        if (workItemType != 'LEG') {
                            $("#btnDismissViolation").hide();
                            grid.element.find(".k-checkbox").hide();
                        }
                        return false;
                    }
                    else {
                        
                        $("#btnDismissViolation").show();
                        var grid = $("#dispositionViolationsResult").data("kendoGrid");
                        grid.element.find(".k-checkbox").show();
                    }
                });
            }
            else {
                $("#btnDismissViolation").show();
            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went wrong. Please try again." }, "error");
        }
    });
}

function DoSettlementAction() {

    var settlementAction = $('#selectSettlementActions').find(":selected").text();
    var settlementActionId = $('#selectSettlementActions').find(":selected").val();
    var settlementId = $("#SettlementId").val();
    var caseTypeId = $("#hdnCaseTypeId").val();

    switch (settlementAction) {
        case 'none':
            break;
        case 'Edit Settlement':
            $("#readOnlySettlement").hide();
            $("#dvEditAdminSettlementView").removeClass('hidden');
            // OpenSettlementEditPage();
            var isLegalSettlement = $('#IsLegalSettlement').val() === 'True' ? true : false;
            NavigateToEditSettlement(settlementId, isLegalSettlement);
            break;
        case 'Complete Settlement Agreement':
            //$("#readOnlySettlement").hide();
            $("#settlementOtherDetails").addClass("hidden");
            $("#dvEditAdminSettlementView").addClass('hidden');
            $("#divUploadSignedDocument").removeClass('hidden');
            //PerformSettlementAction(caseId, settlementActionId, settlementId, caseTypeId);
            break;
        case 'Cancel Settlement Agreement':
            PerformSettlementAction(caseId, settlementActionId, settlementId, caseTypeId);
            break;
        case 'Send Waiver Order':
            //PerformSettlementAction(caseId, settlementActionId, settlementId, caseTypeId);
            NavigateToSettlementDocuments(settlementId, true);
            break;
        case 'Send Agreement to Licensee':
            NavigateToSettlementDocuments(settlementId);
            break;
        case 'Generate Legal Notice':
            NavigateToLegalNotice(settlementId);
            break;
    }
}

function previewCaseDocuments(caseId, workItemType, workitemId) {
    if (caseId == 0)
        return;
    hideMobileSidebar();

    $.ajax({
        type: "GET",
        url: "/Process/WorkflowDocument",
        data: { "workitemType": workItemType, "workitemID": workitemId, "applicationId": caseId, "WorkItemTypeID": $("#hdnWorkItemTypeIDs").val() },
        success: function (data) {
            hideAllPartialViews('CaseDocumentsview');
            $("#CaseDocumentsview").html(data);
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        },
    });
}

function backToReadOnlySettlementEdit() {
    var workItemType = $("#hdnWorkItemTypeID").val();
    if (workItemType == 'LEG') {
        backToReadOnlySettlementFromLegal();
    }
    else {
        RenderSettlementPartialView("Field Settlement");
    }

}
function backToReadOnlySettlementFromLegal() {
    $('#dvAddAdminSettlementView').addClass("hidden");
    $("#dvMainSettelementView").removeClass("hidden");
    $("#dvbtnAddNewSettlement").removeClass("hidden");
    $('#dvSettlementGrid').css('display', 'block');
    $("#dvsettlementeditbtn").addClass("hidden");
}

function OpenSettlementEditPage() {
    // 
    var settlementTypeId = $('#SettlementTypeId').val();
    var responseDueDate = $('#ResponseDue').val();
    var responseEditFollowUp = $('#ResponseFollowup').val();
    var numSusPensionDays = $('#SuspensionDays').val();
    var suspensionStart = $('#SuspensionStart').val();

    document.getElementById('dis_ddlEditAdminSettlementPelalityList').value = settlementTypeId;
    document.getElementById('dis_responseEditDueDate').value = FormatDate(responseDueDate);///.split(' ')[0];
    document.getElementById('dis_responseEditFollowUpDate').value = FormatDate(responseEditFollowUp);//.split(' ')[0];
    document.getElementById('inv_editnumSusPensionDaysEdit').value = numSusPensionDays;
    document.getElementById('dis_SuspensionStartDateEdit').value = FormatDate(suspensionStart);//.split(' ')[0];
    showHideSettlementControlByTypeForEdit(settlementTypeId);
}

function FormatDate(datetimeString) {
    var datetime = new Date(datetimeString);    // Create a JavaScript Date object

    // Extract the date components
    var year = datetime.getFullYear();
    var month = datetime.getMonth() + 1; // Months are 0-based, so add 1
    var day = datetime.getDate();

    // Create a formatted date string in "YYYY-MM-DD" format
    //var formattedDate = year + "-" + (month < 10 ? "0" : "") + month + "-" + (day < 10 ? "0" : "") + day;
    var formattedDate = (month < 10 ? "0" : "") + month + "/" + (day < 10 ? "0" : "") + day + "/" + year;

    return formattedDate;
}

function updateDisAdminSettlementPenalty(_caseId, settlementId) {
    
    /*Start Validations*/
    var isError = false;
    var regex = /^[A-Za-z0-9,. ]+$/;
    var regexnum = /^[0-9]+$/;
    var regexDollor = /(?=.*?\d)^\$ ? (([1 - 9]\d{ 0, 2 } (, \d{ 3 })*)|\d +)?(\.\d{ 1, 2 })?$/;
    var selectedSettlementTypeId = -1;
    var selectedPandaDocTemplateId = "";
    var isLegalSettlement = $('#IsLegalSettlement').val();
    if ($('#dis_ddlAdminSettlementPelalityList').find(":selected").val() == -1) {
        document.getElementById('err_admin_responseAdminPenalityType').classList.remove('hidden');
        isError = true;
    }
    else {
        document.getElementById('err_admin_responseAdminPenalityType').classList.add('hidden');
        selectedSettlementTypeId = $('#dis_ddlAdminSettlementPelalityList').find(":selected").val();
    }

    if ($("#responseDueDate").is(":visible") && $("#dis_responseDueDate").val() == "") {
        document.getElementById('err_admin_responseDue').classList.remove('hidden');
        document.getElementById('err_admin_sameResponseDueValidate').classList.add('hidden');
        isError = true;
    } else {
        document.getElementById('err_admin_responseDue').classList.add('hidden');
    }


    if ($("#responseFollowUp").is(":visible") && $("#dis_responseFollowUpDate").val() == "") {
        document.getElementById('err_admin_responseFollowup').classList.remove('hidden');
        document.getElementById('err_admin_sameResponseInputFollowUp').classList.add('hidden');
        isError = true;
    } else {
        if (new Date($("#dis_responseFollowUpDate").val()) > new Date($("#dis_responseDueDate").val())) {
            document.getElementById('err_admin_followUpgreaterThanValidate').classList.remove('hidden');
            isError = true;
        } else {
            document.getElementById('err_admin_responseFollowup').classList.add('hidden');
            document.getElementById('err_admin_followUpgreaterThanValidate').classList.add('hidden');
        }
    }



    if ($("#divSuspensionInputs").is(":visible") && $("#dis_SuspensionStartDate").val() == "") {
        document.getElementById('err_admin_responseSuspensionStart').classList.remove('hidden');
        isError = true;
    } else {
        document.getElementById('err_admin_responseSuspensionStart').classList.add('hidden');
    }
    if (($("#divSuspensionInputs").is(":visible") && $("#responseDueDate").is(":visible")) && (new Date($("#dis_responseDueDate").val()) > new Date($("#dis_SuspensionStartDate").val()))) {
        document.getElementById('err_admin_responseDueValidate').classList.remove('hidden');
        document.getElementById('err_admin_sameResponseDueValidate').classList.add('hidden');
        isError = true;
    } else {
        document.getElementById('err_admin_responseDueValidate').classList.add('hidden');
    }

    if (($("#divSuspensionInputs").is(":visible") && $("#responseFollowUp").is(":visible")) && (new Date($("#dis_responseFollowUpDate").val()) > new Date($("#dis_SuspensionStartDate").val()))) {
        document.getElementById('err_admin_responseInputFollowUp').classList.remove('hidden');
        document.getElementById('err_admin_sameResponseInputFollowUp').classList.add('hidden');
        isError = true;
    } else {
        document.getElementById('err_admin_sameResponseInputFollowUp').classList.add('hidden');
    }
    if (($("#divSuspensionInputs").is(":visible") && $("#responseDueDate").is(":visible")) && ($("#dis_responseDueDate").val() != "" && $("#dis_SuspensionStartDate").val() != "")) {
        if ($("#dis_responseDueDate").val() == $("#dis_SuspensionStartDate").val()) {
            document.getElementById('err_admin_sameResponseDueValidate').classList.remove('hidden');
            document.getElementById('err_admin_responseDueValidate').classList.add('hidden');
            isError = true;
        } else {
            document.getElementById('err_admin_sameResponseDueValidate').classList.add('hidden');

        }
    }
    if (($("#divSuspensionInputs").is(":visible") && $("#responseFollowUp").is(":visible")) && ($("#dis_responseFollowUpDate").val() != "" && $("#dis_SuspensionStartDate").val() != "")) {
        if ($("#dis_responseFollowUpDate").val() == $("#dis_SuspensionStartDate").val()) {
            document.getElementById('err_admin_sameResponseInputFollowUp').classList.remove('hidden');
            document.getElementById('err_admin_responseInputFollowUp').classList.add('hidden');
            isError = true;
        } else {
            document.getElementById('err_admin_sameResponseInputFollowUp').classList.add('hidden');
        }
    }
    if ($('#divPenatyInput').is(":visible")) {
        if ($("#inv_penalityAmountEdit").val() == "") {
            document.getElementById('err_admin_responsePenalityAmount').classList.remove('hidden');
            document.getElementById('formatErr_admin_responsePenalityAmountOtherEdit').classList.add('hidden');
            isError = true;
        } else if ($("#inv_penalityAmountEdit").val().replace(/\s+/g, '') == "" || !regex.test($("#inv_penalityAmountEdit").val())) {
            document.getElementById('err_admin_responsePenalityAmount').classList.add('hidden');
            document.getElementById('formatErr_admin_responsePenalityAmountOtherEdit').classList.remove('hidden');
            isError = true;
        } else {
            document.getElementById('err_admin_responsePenalityAmount').classList.add('hidden');
            document.getElementById('formatErr_admin_responsePenalityAmountOtherEdit').classList.add('hidden');
        }

        ////EGIS-1918
        //if ($("#dis_penaltyResponseDueDate").val() == "" || $("#dis_penaltyResponseDueDate").val() == undefined) {
        //    document.getElementById('err_admin_penaltyresponseDue').classList.remove('hidden');
        //    if (document.getElementById('err_admin_penaltyresponseDueValidate') !== null) { document.getElementById('err_admin_penaltyresponseDueValidate').classList.add('hidden') };
        //    isError = true;
        //} else {
        //    if (document.getElementById('err_admin_penaltyresponseDue') !== null) { document.getElementById('err_admin_penaltyresponseDue').classList.add('hidden') };
        //}

        ////EGIS-1918
        //if (($("#divSuspensionInputs").is(":visible") && $("#dis_penaltyResponseDueDate").is(":visible")) && (new Date($("#dis_penaltyResponseDueDate").val()) > new Date($("#dis_SuspensionStartDate").val()) || new Date($("#dis_penaltyResponseDueDate").val()) == new Date($("#dis_SuspensionStartDate").val()))) {
        //    document.getElementById('err_admin_penaltyresponseDueValidate').classList.remove('hidden');
        //    document.getElementById('err_admin_penaltysameResponseDueValidate').classList.add('hidden');
        //    isError = true;
        //} else {
        //    document.getElementById('err_admin_penaltyresponseDueValidate').classList.add('hidden');
        //}

        ////EGIS-1918
        //if ($("#dis_penaltyResponseDueDate").is(":visible") && (new Date($("#dis_responseDueDate").val()) > new Date($("#dis_penaltyResponseDueDate").val())) || new Date($("#dis_responseDueDate").val()) == new Date($("#dis_penaltyResponseDueDate").val())) {
        //    document.getElementById('err_admin_penaltyResponseFutureDueValidate').classList.remove('hidden');
        //    document.getElementById('err_admin_responseDueValidate').classList.add('hidden');
        //    document.getElementById('err_admin_sameResponseDueValidate').classList.add('hidden');
        //    isError = true;
        //} else {
        //    document.getElementById('err_admin_penaltyResponseFutureDueValidate').classList.add('hidden');
        //}
    }

    if (($("#divSuspensionInputs").is(":visible") && $("#divSuspensionDays").is(":visible")) && $("#inv_numSusPensionDaysEdit").val() == "") {
        document.getElementById('err_admin_responseSuspensionDays').classList.remove('hidden');
        document.getElementById('formatErr_admin_suspensionDaysOtherEdit').classList.add('hidden');
        isError = true;
    } else {
        document.getElementById('err_admin_responseSuspensionDays').classList.add('hidden');
        document.getElementById('formatErr_admin_suspensionDaysOtherEdit').classList.add('hidden');
    }
    if (($("#divSuspensionInputs").is(":visible") && $("#divSuspensionDays").is(":visible")) && (ValidateSuspensionStartOverlappingDate($("#dis_SuspensionStartDate").val(), $("#inv_numSusPensionDaysEdit").val(), caseId, settlementId) !== "")) {
        document.getElementById('err_admin_suspensionOverlappingDateValidate').classList.remove('hidden');
        isError = true;
    } else {
        document.getElementById('err_admin_suspensionOverlappingDateValidate').classList.add('hidden');
    }

    //Warning EGIS-1621
    if ($('#dis_ddlAdminSettlementPelalityList').find(":selected").val() == -1) {
        if ($("#warningIssuedDate").is(":visible") && $("#dis_warningIssuedDate").val() == "") {
            document.getElementById('err_admin_warningIssuedDate').classList.remove('hidden');
            //document.getElementById('err_admin_sameResponseDueValidate').classList.add('hidden');
            isError = true;
        } else {
            document.getElementById('err_admin_warningIssuedDate').classList.add('hidden');
        }

        if ($('#dis_ddlissuingDivision').find(":selected").val() == -1) {
            document.getElementById('err_admin_issuingDivision').classList.remove('hidden');
            isError = true;
        }
        else {
            document.getElementById('err_admin_issuingDivision').classList.add('hidden');
            selectedSettlementTypeId = $('#dis_ddlissuingDivision').find(":selected").val();
        }

        if ($('#dis_ddlAdminWarningIssuedBy').find(":selected").val() == -1) {
            document.getElementById('err_admin_WarningIssuedBy').classList.remove('hidden');
            isError = true;
        }
        else {
            document.getElementById('err_admin_WarningIssuedBy').classList.add('hidden');
            selectedSettlementTypeId = $('#dis_ddlAdminWarningIssuedBy').find(":selected").val();
        }
    }

    //

    //var reducedNumberOfDays = null;
    //var reducedPenalty = null;
    //let selectedText = $('#dis_ddlAdminSettlementPelalityList').find("option:selected").text();
    //if (selectedText != null && selectedText.trim() != '' && selectedText.toLowerCase().indexOf('education') != -1) {
    //    let reducedNumberOfDaysValue = $('#ddl_ReducedNumberOfDays').val();
    //    if (reducedNumberOfDaysValue != null && reducedNumberOfDaysValue.trim() != '') {
    //        reducedNumberOfDays = parseInt(reducedNumberOfDaysValue);
    //        reducedPenalty = $('#inv_ReducedPenaltyAmount').val();
    //    }
    //}

    var settlementType = $('#dis_ddlAdminSettlementPelalityList').find(":selected").text();
    var reducedNumberDays = 0;
    var reducedPenaltyAmount = 0;
    var totalPenalty = $('#inv_penalityEditAmountEdit').val();
    var totalDays = $('#inv_editnumSusPensionDaysEdit').val();
    var reducedDays = $('#ddl_ReducedNumberOfDays').val();
    reducedPenaltyAmount = $('#inv_ReducedPenaltyAmount').val();

    if (settlementType === "Suspension or Civil Penalty With Education" || settlementType === "Suspension or Civil Penalty with Education and Bond") {
        //ddl_ReducedNumberOfDays
        if (reducedDays !== "" && parseInt(reducedDays) > 0) {
            document.getElementById('err_admin_reduceNumberDays').classList.add('hidden');
            if (parseInt(reducedDays) > parseInt(totalDays)) {
                $('#err_admin_reduceNumberDays').removeClass('hidden');
                isError = true;
            } else {
                reducedNumberDays = reducedDays;
                /*reducedPenaltyAmount = $('#inv_ReducedPenaltyAmount').val();*/
            }
        } else {
            document.getElementById('err_edit_admin_reduceNumberDays').classList.remove('hidden');
            isError = true;
        }

        ////EGIS-1918
        //if ($("#dis_educationResponseDueDate").val() == "" || $("#dis_educationResponseDueDate").val() == undefined) {
        //    document.getElementById('err_admin_educationresponseDue').classList.remove('hidden');
        //    document.getElementById('err_admin_educationresponseDueValidate').classList.add('hidden');
        //    isError = true;
        //} else {
        //    document.getElementById('err_admin_educationresponseDue').classList.add('hidden');
        //}

        ////EGIS-1918
        //if (($("#divSuspensionInputs").is(":visible") && $("#dis_educationResponseDueDate").is(":visible")) && (new Date($("#dis_educationResponseDueDate").val()) > new Date($("#dis_SuspensionStartDate").val()) || new Date($("#dis_educationResponseDueDate").val()) == new Date($("#dis_SuspensionStartDate").val()))) {
        //    document.getElementById('err_admin_educationresponseDueValidate').classList.remove('hidden');
        //    document.getElementById('err_admin_educationsameResponseDueValidate').classList.add('hidden');
        //    isError = true;
        //} else {
        //    document.getElementById('err_admin_educationresponseDueValidate').classList.add('hidden');
        //}

        ////EGIS-1918
        //if ($("#dis_educationResponseDueDate").is(":visible") && (new Date($("#dis_responseDueDate").val()) > new Date($("#dis_educationResponseDueDate").val())) || new Date($("#dis_responseDueDate").val()) == new Date($("#dis_educationResponseDueDate").val())) {
        //    document.getElementById('err_admin_educationsameResponseDueValidate').classList.remove('hidden');
        //    document.getElementById('err_admin_educationresponseDueValidate').classList.add('hidden');
        //    //document.getElementById('err_admin_sameResponseDueValidate').classList.add('hidden');
        //    isError = true;
        //} else {
        //    document.getElementById('err_admin_educationsameResponseDueValidate').classList.add('hidden');
        //}

        ////EGIS-1918
        //if ($("#dis_educationResponseDueDate").is(":visible") && (new Date($("#dis_penaltyResponseDueDate").val()) > new Date($("#dis_educationResponseDueDate").val())) || new Date($("#dis_penaltyResponseDueDate").val()) == new Date($("#dis_educationResponseDueDate").val())) {
        //    document.getElementById('err_admin_educationPenaltyFutureDueValidate').classList.remove('hidden');
        //    document.getElementById('err_admin_educationresponseDueValidate').classList.add('hidden');
        //    document.getElementById('err_admin_educationsameResponseDueValidate').classList.add('hidden');
        //    isError = true;
        //} else {
        //    document.getElementById('err_admin_educationPenaltyFutureDueValidate').classList.add('hidden');
        //}

        if (reducedPenaltyAmount !== "" && parseInt(reducedPenaltyAmount) > 0) {
            document.getElementById('err_edit_admin_reduceNumberDaysthanSettlementDays').classList.add('hidden');
            if (parseInt(reducedPenaltyAmount) > parseInt(totalPenalty)) {
                $('#err_edit_admin_reduceNumberDaysthanSettlementDays').removeClass('hidden');
                isError = true;
            }
        } else {
            document.getElementById('err_edit_admin_reducePenaltyAmount').classList.remove('hidden');
            isError = true;
        }
    }

    if (isError === false) {
        isError = SettlementDueDatesValidation(0);
    }

    if (isError)
        return;

    caseId = _caseId;// $("#CaseId").val();
    //var workItemID = $("#hdnWorkItemID").val();
    //var templateName = "";
    //var template_Id = "";
    //var TempName = "";
    //var TemplateContent = "";

    //if ($("#dvCMTemplate").is(":visible")) {
    //    templateName = $("#dis_ddlCMTemplateList option:selected").text();
    //    template_Id = $("#dis_ddlCMTemplateList").val();
    //    TempName = templateName.replace("Select", "") + getCurrentDateTime() + ".pdf";
    //    TemplateContent = document.getElementById("divCMTemplateContent").innerHTML;
    //}
    //SaveSelectedTemplateDocument(template_Id, templateName);


    // model.UploadedFiles = arrUploadedFileIDs;
    var model = new Object();
    model.SelectedTemplateId = null;
    model.SelectedTemplateContent = null;
    // model.SelectedTemplateFormat = $('#ddl_export').find(":selected").val();
    model.CaseTypeId = $("#hdnCaseTypeId").val();
    // model.FileName = TempName;
    //  model.DocumentNote = "System Generated Settlement Letter -" + TempName;


    model.DispositionRecommendationId = caseId;
    model.PenaltyTypeID = $('#dis_ddlAdminSettlementPelalityList').find(":selected").val();
    model.ResponseDue = $("#dis_responseDueDate").val();
    model.ResponseFollowUp = $("#dis_responseFollowUpDate").val();
    model.MonetaryAmount = $("#inv_penalityAmountEdit").val();
    model.PenaltyResponseDue = $("#dis_penaltyResponseDueDate").val(); //EGIS-1918
    model.SuspensionDays = $("#inv_numSusPensionDaysEdit").val();
    model.SuspensionStart = $("#dis_SuspensionStartDate").val();

    model.WarningIssuingDivision = $('#dis_ddlissuingDivision').find(":selected").val();//////////
    model.WarningIssuedBy = $('#dis_ddlAdminWarningIssuedBy').find(":selected").val();/////
    model.AdminWarningIssuedDate = $("#dis_warningIssuedDate").val();////////

    const workItem = getReqWorkItemType();// getWorkItemType();
    model.ReferenceItemID = workItem.ItemId;
    model.ReferenceItemTypeID = workItem.ItemTypeId;

    model.WorkItemId = $("#hdnWorkItemID").val();
    model.AdminSettlementId = settlementId;
    model.IsLegalSettlement = $('#IsLegalSettlement').val();
    model.reducedNumberOfDays = reducedNumberDays;
    model.EducationResponseDue = $("#dis_educationResponseDueDate").val(); //EGIS-1918
    model.reducedPenaltyAmount = reducedPenaltyAmount
    $.ajax({
        type: "POST",
        url: "/Process/CreateAdminSettlementAsDraft",
        contentType: "application/json",
        data: JSON.stringify(model),
        success: function (data) {
            var popupNotification = $("#Notification").data("kendoNotification");
            if (data) {
                popupNotification.show({ message: "Settlement updated successfully." }, "success");
                // resetEditDisAdminSettlementPenalty();
                //$("#dvSettlementDocument").removeClass("hidden");
                //$("#dvMainSettelementView").removeClass("hidden");
                //$("#dvSettlementGrid").addClass("hidden");
                //$("#dvbtnAddNewSettlement").addClass("hidden");


                //ShowSettlementDocumentSection($("#SettlementId").val(), $("#CaseId").val(), $('#hdnCaseTypeId').val(), $("#DocumentType").val(), $("#SettlementDocumentAction").val());                previewSettlementByCaseId(caseId);
                ////RenderMenuPartialView('Settlement');
                
                //previewSettlementData(settlementId, "Administrative Case", caseId);
                //previewSettlementDocument();
                var workItemType = $("#hdnWorkItemTypeID").val();

                if (workItemType == 'LEG') {
                    previewSettlementByCaseId(caseId, true);
                    backToReadOnlySettlementFromLegal();
                }
                else {
                    RenderSettlementPartialView("Field Settlement");
                }
            }
            else
                popupNotification.show({ message: "Error while processing request" }, "error");
        },
        error: function (objError) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Error while processing request" }, "error");
        }
    });
}

function SettlementDueDatesValidation(flagVal = 1) {
    var isError = false;

    //EGIS-1918
    if ($("#dis_responseDueDate").is(":visible") && ($("#dis_responseDueDate").val() == "" || $("#dis_responseDueDate").val() == undefined)) {
        document.getElementById('err_admin_responseDue').classList.remove('hidden');
        //if (document.getElementById('err_admin_penaltyresponseDueValidate') !== null) { document.getElementById('err_admin_penaltyresponseDueValidate').classList.add('hidden') };
        isError = true;
        return isError;
    } else {
        document.getElementById('err_admin_responseDue').classList.add('hidden');
        if (flagVal !== 0 && flagVal.sender.element[0].id == "dis_responseDueDate") {
            var responseDueDate = new Date($("#dis_responseDueDate").val());
            if ($('#divResponseFollowUp').is(":visible")) {
                if (new Date($("#dis_responseFollowUpDate").val()) > responseDueDate || ($("#dis_responseFollowUpDate").val() == '' || $("#dis_responseFollowUpDate").val() == undefined)) {
                    var reminderDate = new Date(responseDueDate.setDate(responseDueDate.getDate() - 1));

                    var dd = reminderDate.getDate();
                    var mm = reminderDate.getMonth() + 1; //January is 0!
                    var yyyy = reminderDate.getFullYear();
                    if (dd < 10) { dd = '0' + dd }
                    if (mm < 10) { mm = '0' + mm }
                    var date = mm + '/' + dd + '/' + yyyy;

                    $("#dis_responseFollowUpDate").val(date);
                }
            }
        }
        //if (document.getElementById('err_admin_penaltyresponseDue') !== null) { document.getElementById('err_admin_penaltyresponseDue').classList.add('hidden') };
    }

    //EGIS-1918
    if ($("#dis_penaltyResponseDueDate").is(":visible") && ($("#dis_penaltyResponseDueDate").val() == "" || $("#dis_penaltyResponseDueDate").val() == undefined)) {
        document.getElementById('err_admin_penaltyresponseDue').classList.remove('hidden');
        if (document.getElementById('err_admin_penaltyresponseDueValidate') !== null) { document.getElementById('err_admin_penaltyresponseDueValidate').classList.add('hidden') };
        isError = true;
        return isError;
    } else {
        if (document.getElementById('err_admin_penaltyresponseDue') !== null) { document.getElementById('err_admin_penaltyresponseDue').classList.add('hidden') };
    }

    //EGIS-1918
    if (($("#divSuspensionInputs").is(":visible") && $("#dis_penaltyResponseDueDate").is(":visible")) && (new Date($("#dis_penaltyResponseDueDate").val()) > new Date($("#dis_SuspensionStartDate").val()) || $("#dis_penaltyResponseDueDate").val() == $("#dis_SuspensionStartDate").val())) {
        document.getElementById('err_admin_penaltyresponseDueValidate').classList.remove('hidden');
        document.getElementById('err_admin_penaltysameResponseDueValidate').classList.add('hidden');
        isError = true;
        return isError;
    } else {
        document.getElementById('err_admin_penaltyresponseDueValidate').classList.add('hidden');
    }

    //EGIS-1918
    if ($("#dis_penaltyResponseDueDate").is(":visible")
        && (new Date($("#dis_responseDueDate").val()) > new Date($("#dis_penaltyResponseDueDate").val()))
        || ($("#dis_penaltyResponseDueDate").is(":visible") && $("#dis_responseDueDate").val() == $("#dis_penaltyResponseDueDate").val())) {
        document.getElementById('err_admin_penaltyResponseFutureDueValidate').classList.remove('hidden');
        document.getElementById('err_admin_responseDueValidate').classList.add('hidden');
        document.getElementById('err_admin_sameResponseDueValidate').classList.add('hidden');
        isError = true;
        return isError;
    } else {
        document.getElementById('err_admin_penaltyResponseFutureDueValidate').classList.add('hidden');
    }

    //EGIS-1918
    if ($("#dis_educationResponseDueDate").is(":visible") && ($("#dis_educationResponseDueDate").val() == "" || $("#dis_educationResponseDueDate").val() == undefined)) {
        document.getElementById('err_admin_educationresponseDue').classList.remove('hidden');
        document.getElementById('err_admin_educationresponseDueValidate').classList.add('hidden');
        isError = true;
        return isError;
    } else {
        document.getElementById('err_admin_educationresponseDue').classList.add('hidden');
    }

    //EGIS-1918
    if (($("#divSuspensionInputs").is(":visible") && $("#dis_educationResponseDueDate").is(":visible")) && (new Date($("#dis_educationResponseDueDate").val()) > new Date($("#dis_SuspensionStartDate").val()) || $("#dis_educationResponseDueDate").val() == $("#dis_SuspensionStartDate").val())) {
        document.getElementById('err_admin_educationresponseDueValidate').classList.remove('hidden');
        document.getElementById('err_admin_educationsameResponseDueValidate').classList.add('hidden');
        isError = true;
        return isError;
    } else {
        document.getElementById('err_admin_educationresponseDueValidate').classList.add('hidden');
    }

    //EGIS-1918
    if ($("#dis_educationResponseDueDate").is(":visible") &&( (new Date($("#dis_responseDueDate").val()) > new Date($("#dis_educationResponseDueDate").val())) || $("#dis_responseDueDate").val() == $("#dis_educationResponseDueDate").val())) {
        document.getElementById('err_admin_educationsameResponseDueValidate').classList.remove('hidden');
        document.getElementById('err_admin_educationresponseDueValidate').classList.add('hidden');
        //document.getElementById('err_admin_sameResponseDueValidate').classList.add('hidden');
        isError = true;
        return isError;
    } else {
        document.getElementById('err_admin_educationsameResponseDueValidate').classList.add('hidden');
    }

    //EGIS-1918
    if ($("#dis_educationResponseDueDate").is(":visible") &&
        (new Date($("#dis_penaltyResponseDueDate").val()) < new Date($("#dis_educationResponseDueDate").val()) ||
            $("#dis_penaltyResponseDueDate").val() == $("#dis_educationResponseDueDate").val())) {
        document.getElementById('err_admin_educationPenaltyFutureDueValidate').classList.remove('hidden');
        document.getElementById('err_admin_educationresponseDueValidate').classList.add('hidden');
        document.getElementById('err_admin_educationsameResponseDueValidate').classList.add('hidden');
        isError = true;
        return isError;
    } else {
        document.getElementById('err_admin_educationPenaltyFutureDueValidate').classList.add('hidden');
    }

    if (isError === false) {
        $('.field-validation-error').addClass('hidden');
    }
    return isError;
}

function PerformSettlementAction(caseId, settlementActionId, settlementId, caseTypeId, request = null) {
    
    var caseType = '';
    if (caseTypeId == 1) {
        caseType = 'Admin Case';
    }
    else {
        caseType = 'Criminal Case';
    }
    if (settlementActionId == 1 || settlementActionId == 2) {
        var model = new Object();
        model.SettlementActionId = settlementActionId;
        model.SettlementId = settlementId
        model.CaseType = caseType;
        const urlParams = new URLSearchParams(window.location.search.toLowerCase());
        model.WorkItemId = urlParams.get('workitemid');
        model.WorkItemTypeId = urlParams.get('workitemtypeid');
        if (settlementActionId === "1" && request !== null) {
            model.FileID = request.FileID;
            model.FileName = request.FileName;
            model.DocumentType = request.DocumentType;
            model.IsEducationSelectedbyUser = request.IsEducationSelectedbyUser;
        }
        $.ajax({
            type: "POST",
            url: "/Enforcement/PerformSettlementAction",
            contentType: "application/json",
            data: JSON.stringify(model),
            success: function (data) {
                var popupNotification = $("#Notification").data("kendoNotification");
                if (data == "True") {
                    RenderSettlementPartialView("Field Settlement");
                    popupNotification.show({ message: "Request processed successfully." }, "success");
                    $("html,body").animate(
                        {
                            scrollTop: $("#dvMainSettelementView").offset().top,
                        },
                        "slow"
                    );
                    popupNotification.show({ message: "Request processed successfully." }, "success");
                }
                else
                    popupNotification.show({ message: "Error while processing request" }, "error");
            },
            error: function (objError) {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "Error while processing request" }, "error");
            }
        });
    }
    else if (settlementActionId == 5) {
        if (settlementId > 0 && caseId > 0) {
            var request = new Object();
            request.SettlementId = settlementId;
            request.CaseId = caseId;
            request.CaseTypeId = caseTypeId;
            request.DocumentType = "Waiver Order";
            request.SettlementDocumentAction = "Requested";

            $.ajax({
                type: "POST",
                url: "/Apps/SettlementDocument",
                contentType: "application/json",
                data: JSON.stringify(request),
                success: function (data) {
                    
                    $('#divWaiverSettlementDocument').html(data);
                    $("#adminSettlementResult").addClass('hidden');
                    $("#divUploadWaiver").removeClass('hidden');
                },
                error: function (objError) {
                    var popupNotification = $("#Notification").data("kendoNotification");
                    popupNotification.show({ message: "Error while processing request" }, "error");
                }
            });
        }
        else {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Settlement of  the case does not exists." }, "error");
        }
    }
    else {
        var popupNotification = $("#Notification").data("kendoNotification");
        popupNotification.show({ message: "Action not allow." }, "info");
    }
}

function sendWaiverToPublicUser() {
    var settlementActionId = $('#selectSettlementActions').find(":selected").val();
    var settlementId = $("#SettlementId").val();
    var workItemID = $("#hdnWorkItemID").val();
    var workItemTypeId = $("#hdnWorkItemTypeIDs").val();

    var grid = $("#SettlementDocumentHistoryGrid").data("kendoGrid");
    var dataSource = grid.dataSource;
    var totalRecords = dataSource.total();
    if (totalRecords > 0) {
        var model = new Object();
        model.SettlementActionId = settlementActionId;
        model.SettlementId = settlementId
        model.CaseType = 'Admin Case';
        model.WorkItemId = workItemID;
        model.WorkItemTypeId = workItemTypeId;
        const urlParams = new URLSearchParams(window.location.search.toLowerCase());
        model.WorkItemId = urlParams.get('workitemid');
        model.WorkItemTypeId = urlParams.get('workitemtypeid');
        $.ajax({
            type: "POST",
            url: "/Enforcement/PerformSettlementAction",
            contentType: "application/json",
            data: JSON.stringify(model),
            success: function (data) {
                var popupNotification = $("#Notification").data("kendoNotification");
                if (data) {
                    RenderSettlementPartialView("Field Settlement");
                    popupNotification.show({ message: "Request processed successfully." }, "success");
                    $("html,body").animate(
                        {
                            scrollTop: $("#dvMainSettelementView").offset().top,
                        },
                        "slow"
                    );
                }
                else
                    popupNotification.show({ message: "Error while processing request" }, "error");
            },
            error: function (objError) {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "Error while processing request" }, "error");
            }
        });
    }
    else {
        var popupNotification = $("#Notification").data("kendoNotification");
        popupNotification.show({ message: "Please upload waiver order" }, "error");
    }
}
function resetEditDisAdminSettlementPenalty() {
    document.getElementById("EditAdminSettlementForm").reset();
    /*$("#screenTitle").text("Settlement & Waiver Agreements");*/
    var els = document.getElementsByClassName('field-validation-error');
    Array.prototype.forEach.call(els, function (el) {
        el.classList.add('hidden');
    });

    $("#readOnlySettlement").show();
    $("#dvEditAdminSettlementView").addClass('hidden');
    $("#divUploadSignedDocument").addClass('hidden');
    $("#selectSettlementActions").val('-1');//Defaulted to Actions

}

function getDataElementCaseViewSummaryReportTR(title, value, colspan, width = 40) {
    if (!colspan)
        return (
            '<tr>' +
            '<th scope="row" width="' + width + '%" class="sero-body2 text-navy font-weight-bold">' + title + ':</th>' +
            '<td class="sero-body2 text-navy font-weight-normal">' + value + '</td>' +
            '</tr>');
    return (
        '<tr>' +
        '<td class="sero-body2 text-navy font-weight-normal" colspan=' + colspan + '>' + value + '</td>' +
        '</tr>');
}

function getDataElementCaseViewSummaryReportHeader(title) {
    return ('<h3 class="text-center border-wrapper sero-headline5">' + title + '</h3>');
}

function getDataElementCaseViewSummaryReportTable(action) {
    if (action === 'start')
        return ('<div><table class="table table-borderless table-sm mb-1 table-mobile"> <tbody>');
    else
        return ("</tbody></table></div>");
}

function getDataElementCaseViewSummaryReportPageBreakAvoid(action) {
    if (action === 'start')
        return ('<div class="page -break-avoid">');
    else
        return ('</div>');
}

function getDataElementCaseViewSummaryReportLineBreak() {
    return ('<br />');
}

function printCaseViewSummaryPDF() {
    printJS({
        printable: 'caseViewSummaryPrintArea',
        type: 'html',
        targetStyles: ["*"]
    })
}

function printLegalCaseViewSummaryPDF() {
    printJS({
        printable: 'viewLegalDispositionData_ReadOnly',
        type: 'html',
        targetStyles: ["*"]
    })
}

function bindCaseSummaryReportAssociations() {
    const containerId = 'caseViewSummaryPartialViewAssociations';
    $('#' + containerId).empty();
    const workItem = getWorkItemType();
    $.ajax({
        type: "GET",
        url: "/Enforcement/GetInvAssociations?itemTypeId=" + workItem.ItemTypeId + "&itemId=" + workItem.ItemId + "&workItemId=" + workItem.Workitem_Id,
        dataType: "json",
        success: function (results) {
            let dataElements = '<div class="col-12">';
            dataElements += getDataElementCaseViewSummaryReportHeader('Associations');
            $('#' + containerId).append(dataElements);
            $('#' + containerId).append('<div id="' + containerId + 'Data" />');
            $('#' + containerId + 'Data').kendoGrid({
                dataSource: {
                    data: results,
                    schema: {
                        model: {
                            fields: {
                                ID: { type: "number" },
                                AssociationRecordID: { type: "number" },
                                AssociationRecordType: { type: "string" },
                                AssociationRecordIdentifier: { type: "string" },
                                strCreatedBy: { type: "string" },
                                DateCreated: { type: "date" }
                            }
                        }
                    },
                    pageSize: results.length
                },
                scrollable: false,
                columns: [
                    { field: "AssociationRecordType", title: "Type", width: 80 },
                    { field: "AssociationRecordID", title: "Id", width: 50 },
                    { field: "AssociationRecordIdentifier", title: "Identifier", width: 150 },
                    { field: "strCreatedBy", title: "Recording Agent", width: 80 },
                    { field: "DateCreated", title: "Date", width: 80, format: "{0:MM/dd/yyyy}" }
                ]
            });
            HideLoader();
        },
        error: function (xhr) {
            HideLoader();
        },
    });
}

function bindCaseSummaryReportBasicInfo() {
    $('#caseViewSummaryPartialViewBasicInfo').empty();
    $.ajax({
        type: "GET",
        url: "/Enforcement/GetDispositionRecommendationMasterById?dispositionRecommendationId=" + caseId,
        dataType: "json",
        success: function (data) {
            if (!data) {
                HideLoader();
                return;
            }

            var dataElements = '<div class="col-12">';
            dataElements += getDataElementCaseViewSummaryReportPageBreakAvoid('start');
            dataElements += getDataElementCaseViewSummaryReportTable('start');
            dataElements += getDataElementCaseViewSummaryReportTR('Case ID', data.DispositionRecommendationId);
            dataElements += getDataElementCaseViewSummaryReportTR('Case Type', data.CaseType);
            dataElements += getDataElementCaseViewSummaryReportTR('Status', data.Status != "" ? data.Status : 'None');
            dataElements += getDataElementCaseViewSummaryReportTR('Case sensitivity', data.IsJuvenileJustice ? "Juvenile" : "Standard");
            dataElements += getDataElementCaseViewSummaryReportTR('Case adopted', data.IsCaseAdopted ? "Yes" : "No");
            dataElements += getDataElementCaseViewSummaryReportTR('Case Clearance', data.IsClassified ? "Classified" : "Unclassified");
            dataElements += getDataElementCaseViewSummaryReportTR('Subject', data.Subject != "" ? data.Subject : "None");
            dataElements += getDataElementCaseViewSummaryReportTR('Investigation source', data.CustomInvNumber != "" ? data.CustomInvNumber : "None");
            dataElements += getDataElementCaseViewSummaryReportTR('Primary Investigator', data.InvestigatingCPO != "" ? data.InvestigatingCPO : "None");
            dataElements += getDataElementCaseViewSummaryReportTR('Penalty ID', data.PenaltyId != "" ? data.PenaltyId : "None");
            dataElements += getDataElementCaseViewSummaryReportTR(data.CaseTypeId == 1 ? 'Admin Notice #' : 'Criminal Citation Number', data.AdminNoticeNumber != "" ? data.AdminNoticeNumber : "None");
            dataElements += getDataElementCaseViewSummaryReportTR('Created Date', data.DateCreated != "" ? new Date(parseInt(data.DateCreated.substr(6))).toLocaleString('en-US') : 'None');
            dataElements += getDataElementCaseViewSummaryReportTable('end');
            dataElements += "</div>";
            $('#caseViewSummaryPartialViewBasicInfo').append(dataElements);

            HideLoader();
        },
        error: function (xhr) {
            HideLoader();
        }
    });
}

function bindCaseSummaryReportInvestigators() {
    const workItem = getWorkItemType();
    $("#caseViewSummaryPartialViewInvestigators").empty();
    $.ajax({
        type: "GET",
        url: "/Enforcement/GetInvAssociatedInvestigators?ItemID=" + workItem.ItemId + "&WorkItemType=" + workItem.Code,
        dataType: "json",
        success: function (results) {

            if (results == "NoInvestigationSelected") {
                HideLoader();
                return;
            }
            let dataElements = '<div class="col-12">';
            dataElements += getDataElementCaseViewSummaryReportHeader('Investigators');
            $('#caseViewSummaryPartialViewInvestigators').append(dataElements);
            $('#caseViewSummaryPartialViewInvestigators').append('<div id="caseViewSummaryPartialViewInvestigatorsData" />');
            $("#caseViewSummaryPartialViewInvestigatorsData").kendoGrid({
                dataSource: {
                    data: results,
                    schema: {
                        model: {
                            fields: {
                                Id: { type: "number" },
                                ItemId: { type: "number" },
                                InvestigatorName: { type: "string" },
                                IsPrimary: { type: "number" },
                                Role: { type: "string" }
                            }
                        }
                    },
                    pageSize: results.length
                },
                scrollable: false,
                columns: [
                    { field: "InvestigatorName", title: "Investigator", width: 200 },
                    { field: "Role", title: "Investigator Role", width: 200 },
                    { field: "AdditionalInfo", title: "AdditionalInfo", width: 200, template: "<div style='white-space:normal;word-break: break-all;'>#= stripHtmlTags(AdditionalInfo) #</div>" },
                ]
            });
            HideLoader();
        },
        error: function (xhr) {
            HideLoader();
        },
    });
}

function bindCaseSummaryReportNotes() {
    $("#caseViewSummaryPartialViewNotes").empty();
    const workItem = getWorkItemType();
    $.ajax({
        type: "GET",
        url: "/Enforcement/GetEnforcementNotes?recordId=" + workItem.ItemId + "&recordType=Case Notes&recordTypeId=" + workItem.ItemTypeId,
        dataType: "json",
        success: function (results) {
            if (!results || results.result.length == 0) {
                HideLoader();
                return;
            }
            let dataElements = '<div class="col-12">';
            dataElements += getDataElementCaseViewSummaryReportHeader('Notes');
            $('#caseViewSummaryPartialViewNotes').append(dataElements);
            $('#caseViewSummaryPartialViewNotes').append('<div id="caseViewSummaryPartialViewNotesData" />');
            results.result.forEach((item, index) => {
                item.Notes = htmlDecode(item.Notes);
            });

            let rowHTML = '<div class="col-12">';
            rowHTML += getDataElementCaseViewSummaryReportPageBreakAvoid('start');
            rowHTML += getDataElementCaseViewSummaryReportTable('start');
            results.forEach((item, index) => {
                rowHTML += getDataElementCaseViewSummaryReportTR('Added by', item.CreatedBy, undefined, 15);
                rowHTML += getDataElementCaseViewSummaryReportTR('Date', item.strDateCreated, undefined, 15);
                rowHTML += getDataElementCaseViewSummaryReportTR('Notes', item.Notes, 2, 15);
                rowHTML += getDataElementCaseViewSummaryReportTR('', '<br />', 2, 15);
            });
            rowHTML += getDataElementCaseViewSummaryReportTable('end');
            $("#caseViewSummaryPartialViewNotesData").html(rowHTML);
            HideLoader();
        },
        error: function (xhr) {
            HideLoader();
        },
    });
}

function bindCaseSummaryReportNarratives() {
    $("#caseViewSummaryPartialViewNarratives").empty();
    const workItem = getWorkItemType();
    $.ajax({
        type: "GET",
        url: "/Enforcement/GetEnforcementNotes?recordId=" + workItem.ItemId + "&recordType=Case Narrative&recordTypeId=" + workItem.ItemTypeId,
        dataType: "json",
        success: function (results) {
            if (!results || results.result.length == 0) {
                HideLoader();
                return;
            }

            results.result.forEach((item, index) => {
                item.Notes = htmlDecode(item.Notes);
            });
            let dataElements = '<div class="col-12">';
            dataElements += getDataElementCaseViewSummaryReportHeader('Narratives');
            $('#caseViewSummaryPartialViewNarratives').append(dataElements);
            $('#caseViewSummaryPartialViewNarratives').append('<div id="caseViewSummaryPartialViewNarrativesData" />');

            let rowHTML = '<div class="col-12">';
            rowHTML += getDataElementCaseViewSummaryReportPageBreakAvoid('start');
            rowHTML += getDataElementCaseViewSummaryReportTable('start');
            results.forEach((item, index) => {
                rowHTML += getDataElementCaseViewSummaryReportTR('Added by', item.CreatedBy, undefined, 15);
                rowHTML += getDataElementCaseViewSummaryReportTR('Date', item.strDateCreated, undefined, 15);
                rowHTML += getDataElementCaseViewSummaryReportTR('Notes', item.Notes, 2, 15);
                rowHTML += getDataElementCaseViewSummaryReportTR('', '<br />', 2, 15);
            });
            rowHTML += getDataElementCaseViewSummaryReportTable('end');
            $("#caseViewSummaryPartialViewNarrativesData").html(rowHTML);
            HideLoader();
        },
        error: function (xhr) {
            HideLoader();
        },
    });
}

function bindCaseSummaryReportAdminPenalties() {
    $("#caseViewSummaryPartialViewAdminPenalties").empty();
    $.ajax({
        type: "GET",
        url: "/Enforcement/GetDispositionAdminPenalties?dispositionRecommendationId=" + caseId,
        dataType: "json",
        success: function (results) {
            if (!results || results.length == 0) {
                HideLoader();
                return;
            }
            let dataElements = '<div class="col-12">';
            dataElements += getDataElementCaseViewSummaryReportHeader('Admin Penalties');
            $('#caseViewSummaryPartialViewAdminPenalties').append(dataElements);
            $('#caseViewSummaryPartialViewAdminPenalties').append('<div id="caseViewSummaryPartialViewAdminPenaltiesData" />');

            $("#caseViewSummaryPartialViewAdminPenaltiesData").kendoGrid({
                dataSource: {
                    data: results,
                    schema: {
                        model: {
                            fields: {
                                AdminPenaltyId: { type: "number" },
                                ResponseStatus: { type: "string" },
                                ResponseDue: { type: "date" },
                                ResponseFollowUp: { type: "date" },
                                CreatedBy: { type: "string" },
                            }
                        }
                    },
                    pageSize: results.length
                },
                scrollable: false,
                columns: [
                    { field: "AdminPenaltyId", title: "Id", width: 130 },
                    { field: "ResponseStatus", title: "Status", width: 180 },
                    { field: "ResponseDue", title: "Due", width: 160, format: "{0:MM/dd/yyyy}" },
                    { field: "ResponseFollowUp", title: "Follow up", width: 160, format: "{0:MM/dd/yyyy}" },
                    { field: "CreatedBy", title: "Added by", width: 180, },
                ]
            });
        },
        error: function (xhr) {
            HideLoader();
        }
    });
}

function bindCaseSummaryReportViolations() {
    $("#caseViewSummaryPartialViewViolations").empty();
    $.ajax({
        type: "GET",
        url: "/Enforcement/GetDispositionRecommendationMasterById?dispositionRecommendationId=" + caseId,
        dataType: "json",
        success: function (results) {
            if (!results || results.length == 0) {
                HideLoader();
                return;
            }
            let dataElements = '<div class="col-12">';
            dataElements += getDataElementCaseViewSummaryReportHeader('Violations');
            $('#caseViewSummaryPartialViewViolations').append(dataElements);
            $('#caseViewSummaryPartialViewViolations').append('<div id="caseViewSummaryPartialViewViolationsData" />');


            $("#caseViewSummaryPartialViewViolationsData").kendoGrid({
                dataSource: {
                    data: results.Violations,
                    schema: {
                        model: {
                            fields: {
                                ViolationId: { type: "number" },
                                ViolationSubType: { type: "string" },
                                ViolationStatus: { type: "string" },
                                strViolationDate: { type: "string" },
                                Notes: { type: "string" },
                                CreatedBy: { type: "string" },
                            }
                        }
                    },
                    pageSize: results.Violations.length
                },
                scrollable: false,
                columns: [
                    { field: "ViolationId", title: "Violation", width: 160, hidden: "true" },
                    { field: "ViolationSubType", title: "Violation", width: 200 },
                    { field: "strViolationDate", title: "Date", width: 130 },
                    { field: "Notes", title: "Notes", width: 200 },
                    { field: "CreatedBy", title: "Added by", width: 160, },
                    { field: "ViolationStatus", title: "Violation Status", width: 200 },
                ]
            });

        },
        error: function (xhr) {
            HideLoader();
        }
    });
}

function bindCaseSummaryReportCourtAttachments() {
    $("#caseViewSummaryPartialViewCourtAttachments").empty();
    $.ajax({
        type: "GET",
        url: "/Enforcement/GetDispositionCourtAttachments?dispositionRecommendationId=" + caseId,
        dataType: "json",
        success: function (results) {
            if (!results || results.length == 0) {
                HideLoader();
                return;
            }
            let dataElements = '<div class="col-12">';
            dataElements += getDataElementCaseViewSummaryReportHeader('Court/Attachments');
            $('#caseViewSummaryPartialViewCourtAttachments').append(dataElements);
            $('#caseViewSummaryPartialViewCourtAttachments').append('<div id="caseViewSummaryPartialViewCourtAttachmentsData" />');

            $("#caseViewSummaryPartialViewCourtAttachmentsData").kendoGrid({
                dataSource: {
                    data: results,
                    schema: {
                        model: {
                            fields: {
                                CourtAttachmentId: { type: "number" },
                                CourtNumber: { type: "string" },
                                DateFiled: { type: "date" },
                                Place: { type: "string" },
                                CreatedBy: { type: "string" },
                            }
                        }
                    },
                    pageSize: results.length
                },
                scrollable: false,
                columns: [
                    { field: "CourtAttachmentId", title: "Id", width: 130 },
                    { field: "CourtNumber", title: "Court Number", width: 180 },
                    { field: "DateFiled", title: "Date", width: 160, format: "{0:MM/dd/yyyy}" },
                    { field: "Place", title: "Place", width: 160, },
                    { field: "CaseCourtType", title: "Court Type", width: 160, },
                    { field: "CreatedBy", title: "Added by", width: 160, },
                ]
            });
        },
        error: function (xhr) {
            HideLoader();
        }
    });
}

function bindCaseSummaryReportSettlements() {
    $("#caseViewSummaryPartialViewSettlements").empty();
    $.ajax({
        type: "GET",
        url: "/Enforcement/GetSettlementByCaseId?caseId=" + caseId,
        dataType: "json",
        success: function (results) {
            if (!results || results.length == 0) {
                HideLoader();
                return;
            }
            let dataElements = '<div class="col-12">';
            dataElements += getDataElementCaseViewSummaryReportHeader('Settlement & Waiver Agreements');
            $('#caseViewSummaryPartialViewSettlements').append(dataElements);
            $('#caseViewSummaryPartialViewSettlements').append('<div id="caseViewSummaryPartialViewSettlementsData" />');
            $("#caseViewSummaryPartialViewSettlementsData").kendoGrid({
                dataSource: {
                    data: results,
                    schema: {
                        model: {
                            fields: {
                                SettlementId: { type: "number" },
                                SettlementType: { type: "string" },
                                ResponseDue: { type: "date" },
                                ResponseFollowup: { type: "date" },
                                SuspensionServedDate: { type: "date" },
                                CreatedBy: { type: "string" },
                                CaseType: { type: "string" },
                            }
                        }
                    },
                    pageSize: results.length
                },
                scrollable: false,
                columns: [
                    { field: "SettlementId", title: "Id", width: 120 },
                    { field: "SettlementType", title: "Type", width: 220 },
                    { field: "ResponseDue", title: "Due", width: 150, format: "{0:MM/dd/yyyy}" },
                    { field: "ResponseFollowup", title: "Follow Up", width: 150, format: "{0:MM/dd/yyyy}" },
                    { field: "SuspensionServedDate", title: "Added by", width: 150, format: "{0:MM/dd/yyyy}" },
                    { field: "CaseType", title: "CaseType", width: 160, hidden: true }
                ]
            });
        },
        error: function (xhr) {
            HideLoader();
        }
    });
}

function EditSettlement(_caseId, _settlementId) {
    
    $.ajax({
        type: "GET",
        url: "/Process/EditSettlementDetails?caseId=" + _caseId + "&settlementId=" + _settlementId,
        dataType: "json",
        success: function (results) {
            

            $("#dvsettlementeditbtn").removeClass("hidden");
            $("#divdraftsavebtns").addClass("hidden");

            $(dis_ddlAdminSettlementPelalityList).val(results.PenaltyTypeId);


            if ($(dis_ddlAdminSettlementPelalityList).val() == 11) {
                $('#divPenatyInput').hide();
                $('#divSuspensionInputs').hide();
                $('#divWarningSettlement').show();
            }
            if ($(dis_ddlAdminSettlementPelalityList).val() == 2) {
                $('#divPenatyInput').hide();
            }
            showHideSettlementControlByType(results.PenaltyTypeId.toString());
            showHideReducedSettlementControlByTypeForEdit();
            if ($(dis_responseFollowUpDate).is(":visible")) { $(dis_responseFollowUpDate).val(results.strResponseFollowup) };
            if ($(dis_responseDueDate).is(":visible")) { $(dis_responseDueDate).val(results.strResponseDue) };
            if ($(inv_penalityAmountEdit).is(":visible")) { $(inv_penalityAmountEdit).val(results.MonetaryAmount) };
            if ($(dis_penaltyResponseDueDate).is(":visible")) { $(dis_penaltyResponseDueDate).val(results.strPenaltyResponseDue) };//EGIS-1918
            if ($(inv_numSusPensionDaysEdit).is(":visible")) { $(inv_numSusPensionDaysEdit).val(results.SuspensionDays) };
            if ($(dis_SuspensionStartDate).is(":visible")) { $(dis_SuspensionStartDate).val(results.strSuspensionStart) };

            if ($(dis_warningIssuedDate).is(":visible")) { $(dis_warningIssuedDate).val(results.strAdminWarningIssuedDate) };
            if ($(dis_ddlissuingDivision).is(":visible")) { $(dis_ddlissuingDivision).val(results.DivisionID) };
            if ($(dis_ddlAdminWarningIssuedBy).is(":visible")) { $(dis_ddlAdminWarningIssuedBy).val(results.CreatedByID) };

            if ($(dis_ddlAdminWarningIssuedBy).is(":visible")) { $(dis_ddlAdminWarningIssuedBy).val(results.CreatedByID) };
            if ($(dis_ddlAdminWarningIssuedBy).is(":visible")) { $(dis_ddlAdminWarningIssuedBy).val(results.CreatedByID) };
            if ($('#ddl_ReducedNumberOfDays').is(":visible")) { $('#ddl_ReducedNumberOfDays').val(results.ReducedNumberOfDays) };
            if ($(dis_educationResponseDueDate).is(":visible")) { $(dis_educationResponseDueDate).val(results.strEducationResponseDue) };//EGIS-1918
            //$("#ddl_ReducedNumberOfDays option").filter(function () {
            //    //may want to use $.trim in here
            //    return $(this).text() == results.ReducedNumberOfDays;
            //}).prop('selected', true) };
            if ($('#inv_ReducedPenaltyAmount').is(":visible")) { $('#inv_ReducedPenaltyAmount').val(results.ReducedPenaltyAmount) };
            //$("#dvSettlementDocumentSubmitBtn").addClass("hidden");
            HideLoader();
        },
        error: function (xhr) {
            HideLoader();
        }
    });
}

function updateSettlement() {

    //replicate add implementation 

}

function bindCaseSummaryReportDocuments() {
    $("#caseViewSummaryPartialViewDocuments").empty();
    const urlParams = new URLSearchParams(window.location.search);
    $.ajax({
        type: "GET",
        url: "/Process/GetWorkFlowDocuments?workitemType=CAS&workitemID=" + urlParams.get('WorkitemID') + "&applicationId=" + urlParams.get('ApplicationID') + "&documentType=",
        dataType: "json",
        success: function (results) {
            if (!results || results.length == 0) {
                HideLoader();
                return;
            }
            let dataElements = '<div class="col-12">';
            dataElements += getDataElementCaseViewSummaryReportHeader('Documents');
            $('#caseViewSummaryPartialViewDocuments').append(dataElements);
            $('#caseViewSummaryPartialViewDocuments').append('<div id="caseViewSummaryPartialViewDocumentsData" />');

            $("#caseViewSummaryPartialViewDocumentsData").kendoGrid({
                dataSource: {
                    data: results,
                    schema: {
                        model: {
                            fields: {
                                DocumentType: { type: "string" },
                                FileName: { type: "string" },
                                DocumentNote: { type: "string" },
                                CreateDate: { type: "date" },
                                Place: { type: "string" },
                                CreatedBy: { type: "string" },
                            }
                        }
                    },
                    pageSize: results.length
                },
                scrollable: false,
                columns: [
                    { field: "DocumentType", title: "Document Type", width: 180 },
                    { field: "FileName", title: "Name", width: 160 },
                    { field: "DocumentNote", title: "Note", width: 200, },
                    { field: "CreatedBy", title: "Uploaded by", width: 100, },
                    { field: "CreateDate", title: "Uploaded On", width: 100, format: "{0:MM/dd/yyyy}" },
                ]
            });
        },
        error: function (xhr) {
            HideLoader();
        }
    });
}

function bindCaseSummaryReportHistory() {
    $("#caseViewSummaryPartialViewHistory").empty();

    const workItem = getWorkItemType();
    var search = new Object();
    search.ReferenceID = workItem.Workitem_Id;
    search.ReferenceTypeID = workItem.ItemTypeId;
    search.ItemId = workItem.ItemId;
    $.ajax({
        type: "POST",
        url: "/Enforcement/GetActionHistory",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(search),
        success: function (results) {
            if (!results || results.length == 0) {
                HideLoader();
                return;
            }
            let dataElements = '<div class="col-12">';
            dataElements += getDataElementCaseViewSummaryReportHeader('Case History');
            $('#caseViewSummaryPartialViewHistory').append(dataElements);
            $('#caseViewSummaryPartialViewHistory').append('<div id="caseViewSummaryPartialViewHistoryData" />');
            $("#caseViewSummaryPartialViewHistoryData").kendoGrid({
                dataSource: {
                    data: results,
                    schema: {
                        model: {
                            fields: {
                                WFWorkItemHistoryID: { type: "number" },
                                WorkItemID: { type: "number" },
                                WorkItemTypeID: { type: "number" },
                                WorkflowActionID: { type: "number" },
                                WorkFlowActionType: { type: "string" },
                                WorkflowActionNotes: { type: "string" },
                                ActionBy: { type: "string" },
                                ActionDate: { type: "string" },
                            }
                        }
                    },
                    pageSize: results.length
                },
                scrollable: false,
                columns: [
                    { field: "WorkFlowActionType", title: "Action", width: 200 },
                    { field: "WorkflowActionNotes", title: "Notes", width: 200, encoded: false },
                    { field: "ActionBy", title: "Action By", width: 200 },
                    { field: "ActionDate", title: "Date", width: 200, format: "{0:g}" }
                ]
            });
        },
        error: function (xhr) {
            HideLoader();
        },
    });
}

function bindcaseViewSummaryPartialWarnings() {
    $("#caseViewSummaryPartialWarnings").empty();


    $.ajax({
        type: "GET",
        url: "/Enforcement/GetCaseRPTWarnings?CaseId=" + caseId,
        dataType: "json",
        contentType: "application/json",
        success: function (data) {
            if (!data) {
                HideLoader();
                return;
            }


            let dataElements = '<div class="col-12">';
            dataElements += getDataElementCaseViewSummaryReportHeader('Warnings');

            data.forEach((item, index) => {
                dataElements += getDataElementCaseViewSummaryReportPageBreakAvoid('start');
                dataElements += getDataElementCaseViewSummaryReportTable('start');
                dataElements += getDataElementCaseViewSummaryReportTR('Warning ID', item.WarningID);
                dataElements += getDataElementCaseViewSummaryReportTR('Created By', item.CreatedBy);
                dataElements += getDataElementCaseViewSummaryReportTR('Violation Date', item.strViolationDate); //; new Date(parseInt(item.StartDateTime.substr(6))).toLocaleString('en-US'));
                dataElements += getDataElementCaseViewSummaryReportTR('Notice Issue Date', item.strNoticeIssueDate);// new Date(parseInt(item.EndDateTime.substr(6))).toLocaleString('en-US'));
                dataElements += getDataElementCaseViewSummaryReportTR('Operation Name', item.OperationName);
                //dataElements += getDataElementCaseViewSummaryReportTR('Multi Agency ', item.IsMultiAgency ? "Yes" : "No");
                //dataElements += getDataElementCaseViewSummaryReportTR('Grant Code', item.GrantCode);
                //dataElements += getDataElementCaseViewSummaryReportTR('Type ', item.ActivityType);
                dataElements += getDataElementCaseViewSummaryReportTR('Division ', item.ActivityDivision);
                dataElements += getDataElementCaseViewSummaryReportTR('Admin Notice Number ', item.AdminNoticeNumber);
                dataElements += getDataElementCaseViewSummaryReportTR('Violation', item.Violation);
                dataElements += getDataElementCaseViewSummaryReportTR('Notes ', item.Notes);
                dataElements += getDataElementCaseViewSummaryReportTable('end');
                dataElements += getDataElementCaseViewSummaryReportHeader('');
            });


            $('#caseViewSummaryPartialWarnings').append(dataElements);

            HideLoader();
        },
        error: function (xhr) {
            HideLoader();
        }
    });

}

function previewCaseOverview() {
    hideAllPartialViews("caseViewSummaryPartialView");
    //ShowLoader();
    bindCaseSummaryReportBasicInfo();
    bindCaseSummaryReportAssociations();
    bindCaseSummaryReportInvestigators();
    bindCaseSummaryReportViolations();
    bindCaseSummaryReportAdminPenalties();
    bindCaseSummaryReportCourtAttachments();
    bindCaseSummaryReportSettlements();
    bindCaseSummaryReportNotes();
    bindCaseSummaryReportNarratives();
    bindCaseSummaryReportDocuments();
    bindCaseSummaryReportHistory();
    bindcaseViewSummaryPartialWarnings();
    //bindCaseInterviewInfo();//to be deleted
}

function ValidateSuspensionStartOverlappingDate(suspensionStartDate, suspensionDays, caseId, settlementId, isLegal = false) {
    if (suspensionStartDate != '' && suspensionDays != '') {
        var rtndata = '';
        $.ajax({
            type: "GET",
            url: "/Enforcement/ValidateSuspensionStartOverlappingDate?suspensionStartDate=" + suspensionStartDate + "&suspensionDays=" + suspensionDays + "&caseId=" + caseId + "&settlementId=" + settlementId + "&isLegal=" + isLegal,
            async: false,
            success: function (data) {
                if (data != null) {
                    rtndata = data;
                }
                else {
                    rtndata = '';
                }
            },
            error: function (xhr) {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "Something went wrong. Please try again." }, "error");
            },
        });
        return rtndata;
    }
    else
        return '';
}

function ShowSettlementDocumentSection(SettlementId, CaseId, CaseTypeId, DocumentType, SettlementDocumentAction) {
    
    if (CaseId > 0) {
        var request = new Object();
        request.SettlementId = SettlementId;
        request.CaseId = CaseId;
        request.CaseTypeId = CaseTypeId;
        request.DocumentType = DocumentType;
        request.SettlementDocumentAction = SettlementDocumentAction;
        $.ajax({
            type: "POST",
            url: "/Apps/SettlementDocument",
            contentType: "application/json",
            data: JSON.stringify(request),
            success: function (data) {
                
                if (data != null) {
                    //hideAllPartialViews('dvSettlementDocument');
                    $("#dvSettlementDocument").html(data);
                    $("#dvSettlementDocumentHistory").addClass("hidden");
                    $("#dvSettlementDocumentSelection").removeClass("hidden");
                    $("#dvSettlementDocumentSubmitBtn").removeClass("hidden");
                    //EGIS-1043 (EGIS-1771 #4)
                    $('#templateradio').attr('checked', 'checked');
                    ShowAndHideDivs();
                    var length = $('#dis_ddlCMTemplateList > option').length;
                    if (length = 2) {
                        $('#dis_ddlCMTemplateList option')[1].selected = true;
                        $("#dis_ddlCMTemplateList").trigger('change');
                    }
                    //
                }
                else {
                    var popupNotification = $("#Notification").data("kendoNotification");
                    popupNotification.show({ message: "No record was found." }, "warning");
                }
            },
            error: function (xhr) {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
            },
        });
    }
    else {
        var popupNotification = $("#Notification").data("kendoNotification");
        popupNotification.show({ message: "Settlement of  the case does not exists." }, "error");
    }
}

function getReqWorkItemType() {
    //TODO 20230221 Code review need to refactor- get the work item type name from database and INV_Search/INS_Create should be removed
    const urlParams = new URLSearchParams(window.location.search.toLowerCase());
    let itemTypeId = 0;
    let itemId = 0;
    let workItemType = urlParams.get('workitemtype');
    //if (!workItemType)
    //    workItemType = urlParams.get('workitemtype');
    let workItemTypeName = '';
    let code = '';
    workItemType = workItemType.toUpperCase();
    switch (workItemType) {
        case 'INV':
            itemId = urlParams.get('appid');
            if (!itemId)
                itemId = urlParams.get('workitemid');
            itemTypeId = 2;
            workItemTypeName = 'Investigation';
            code = 'INV';
            break;
        case 'INV_Search':
        case 'INV_Create':
            itemId = selectedInvestigationId;
            itemTypeId = 2;
            workItemTypeName = 'Investigation';
            code = 'INV';
            break;
        case 'CAS':
            itemId = urlParams.get('applicationid');
            itemTypeId = 23;
            workItemTypeName = 'Case';
            code = 'CAS';
            break;
        case 'INS':
            itemId = urlParams.get('appid');
            if (!itemId)
                itemId = urlParams.get('applicationid');
            if (!itemId)
                itemId = urlParams.get('workitemid');
            itemTypeId = 24;
            workItemTypeName = 'Inspection';
            code = 'INS';
            break;
        case 'INSP_Search':
        case 'INS_Create':
            itemId = $('#ID').val();
            itemTypeId = 24;
            workItemTypeName = 'Inspection';
            code = 'INS';
            break;
        case 'PLT':
            itemId = $("#hdnApplicationId").val();
            itemTypeId = 25;
            workItemTypeName = 'PLAT';
            code = 'PLT';
            break;
        case 'LEG':
            itemId = urlParams.get('applicationid');
            itemTypeId = 15;
            workItemTypeName = 'LEG';
            code = 'LEG';
            break;
        default:
            console.error('Unhandled workItem type. The workitem type ' + workItemType + ' is not handled');
            break;
    }
    return { ItemTypeId: itemTypeId, ItemId: itemId, Name: workItemTypeName, Code: code };
}

function registerViolationEvents() {
    var textEntered_Violations, counter_Violations;
    let editor = $("#inv_caseviolationDetails").data("kendoEditor");
    if (!editor || !$(editor)) return;
    $(editor.body).unbind('keyup', violationKeyupHandler);
    $(editor.body).on('keyup', violationKeyupHandler);
}

function violationKeyupHandler(e) {
    textEntered_Violations = e.target.innerHTML;
    counter_Violations = (500 - (textEntered_Violations.length));
    if (counter_Violations <= 0)
        counter_Violations = 0;
    document.getElementById('counterViolations').textContent = counter_Violations;
    if (textEntered_Violations.length > 499) {
        $('#inv_caseviolationDetails').data('kendoEditor').value(textEntered_Violations.substring(0, 499));
        $("#btnSaveInvestigationViolation").focus();
        counter_Violations = 0;
    }
}

function GetSelectedEDocFile(template_Id, templateName) {

    var TempName = templateName.replace("Select", "") + getCurrentDateTime() + ".pdf";
    if (template_Id != "-1") {
        ShowLoader();
        var settlementDoc = new Object();
        settlementDoc.EDocGenTemplateId = template_Id;
        settlementDoc.FileName = TempName;
        settlementDoc.SettlementId = SettlementId;
        settlementDoc.DocumentType = "Settlement Agreement";
        settlementDoc.IsUploadedByPublicUser = false;
        settlementDoc.IsAllowToPublicUser = true;
        settlementDoc.SettlementDocumentAction = "Requested";
        settlementDoc.CaseID = caseId;
        settlementDoc.CaseTypeId = $("#hdnCaseTypeId").val();
        settlementDoc.DocumentNote = "System Generated Settlement Letter -" + TempName;

        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/Process/GenerateAndDownloadSettlementWaiver', true);
        xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
        xhr.responseType = 'arraybuffer';
        xhr.onload = function (e) {
            if (this.status == 200) {
                var blob = new Blob([this.response], { type: "application/docx" });
                var link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = TempName + '.docx';
                link.click();
                HideLoader();
            }
            else {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "Error while processing request" }, "error");
            }
        };
        xhr.send(JSON.stringify(settlementDoc));
    }
    else {
        var popupNotification = $("#Notification").data("kendoNotification");
        popupNotification.show({ message: "Please select correct letter template." }, "info");
    }
}

function GenerateSuspensionLetter() {
    var TempName = $("#dis_ddlCaseStatus option:selected").text();
    if (TempName != "") {
        ShowLoader();
        var settlementDoc = new Object();
        settlementDoc.EDocGenTemplateId = "";
        settlementDoc.FileName = TempName;
        settlementDoc.SettlementId = SettlementId;
        settlementDoc.DocumentType = "Summary Suspension Order";
        settlementDoc.IsUploadedByPublicUser = false;
        settlementDoc.IsAllowToPublicUser = true;
        settlementDoc.SettlementDocumentAction = "Requested";
        settlementDoc.CaseID = caseId;
        settlementDoc.CaseTypeId = $("#hdnCaseTypeId").val();
        settlementDoc.DocumentNote = "Emergency Summary Suspension";

        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/Process/GenerateEmergencyLetter', true);
        xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
        xhr.responseType = 'arraybuffer';
        xhr.onload = function (e) {
            if (this.status == 200) {
                $("#btnGenerateLetter").addClass('hidden');
                $("#dvNoteAndAction").addClass('hidden');
                $("#divUploadLetter").removeClass('hidden');
                var blob = new Blob([this.response], { type: "application/docx" });
                var link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = TempName + getCurrentDateTime() + '.pdf';
                link.click();
                HideLoader();

            }
        };
        xhr.send(JSON.stringify(settlementDoc));
    }
    else {
        var popupNotification = $("#Notification").data("kendoNotification");
        popupNotification.show({ message: "Please select correct letter template." }, "info");
    }
}

function getCurrentDateTime() {
    var d = new Date($.now());
    return " " + (d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear() + " " + d.getHours() + "." + d.getMinutes() + "." + d.getSeconds());
}

function cancelAction() {
    ShowHideLegalSection(false);
}

function submitLegalCaseAction() {
    var isError = false;
    ////var regex = /^[A-Za-z0-9,. ]+$/;
    //var regex = /^[-~]+$/;


    var actionInput = $('#legal_ActionComment').val();
    var selectedAction = $("#dis_selectLegalCaseActions option:selected").val();
    if (selectedAction === "-1") {
        document.getElementById('err_actionSelect').classList.remove('hidden');
        isError = true;
    } else {
        document.getElementById('err_actionSelect').classList.add('hidden');
        isError = false;
    }
    //if ($('#legal_ActionComment').val() === "") { // EGIS-1407: Is not Manditory Field.
    //    document.getElementById('err_actionComment').classList.remove('hidden');
    //    isError = true;
    //}
    ////else if (actionInput.replace(/\s+/g, '') == "" || !regex.test(actionInput)) {
    ////    document.getElementById('err_actionComment').classList.add('hidden');
    ////    document.getElementById('formatErr_actionComment').classList.remove('hidden');
    ////    isError = true;
    ////}
    //else {
    //    document.getElementById('err_actionComment').classList.add('hidden')
    //    isError = false;        
    //}

    if (isError === false) {
        // submitLegalCaseAction();
        var paramObject = new Object();
        paramObject.CaseId = $('#hdnApplicationId').val();
        paramObject.WorkItemID = $("#hdnWorkItemID").val();
        ;
        paramObject.LastLegalAction = $("#dis_selectLegalCaseActions option:selected").text();
        //paramObject.LastActionBy = appointmentTypeId;
        paramObject.LegalActionComment = actionInput;

        $.ajax({
            type: "POST",
            url: "/Process/SubmitLegalCaseAction",
            data: JSON.stringify(paramObject),
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                if (data == 'error') {
                    var popupNotification = $("#Notification").data("kendoNotification");
                    popupNotification.show({ message: "Something went wrong, please try again." }, "error");
                }
                else {
                    ShowHideCaseSection(false);
                    previewLegalInvCaseOverviewInformation_ReadOnly();
                    var popupNotification = $("#Notification").data("kendoNotification");
                    popupNotification.show({ message: "Legal Action updated successfully." }, "success");
                }
            },
            error: function () {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "Something went wrong, please try again." }, "error");
            }
        });
    }
}

function countPrewActionCommentCharacters(e) {
    var textEntered, counter;
    textEntered = document.getElementById('legal_ActionComment').value;
    counter = (250 - (textEntered.length));
    document.getElementById('actionCommentCounter').textContent = counter;
}

function countPrewSOAHNoteCharacters(e) {
    var textEntered, counter;
    textEntered = document.getElementById('txt_SOAHNote').value;
    counter = (250 - (textEntered.length));
    document.getElementById('countPrewSOAHNoteCharacters').textContent = counter;
}

function CaseAppointment() {
    //divCaseAppointment
    //$('#divCaseAppointment').show();
    if (document.getElementById('divCaseAppointment')) {
        document.getElementById('divCaseAppointment').classList.remove('hidden');
    }

    ShowHideCaseSection(true);
    getCaseAppointmentList();
    //ShowHideLegalSection(true, 'appointment');
}

function HideLegalActionDivs() {
    if (document.getElementById('divAssignDocketNumber')) {
        $('#divAssignDocketNumber').hide();
    }
    if (document.getElementById('divUpdateSOAHNumber')) {
        $('#divUpdateSOAHNumber').hide();
    }
    if (document.getElementById('divUpdateLegalAction')) {
        document.getElementById('divUpdateLegalAction').classList.add('hidden');
    }
    if (document.getElementById('divCaseAppointment')) {
        document.getElementById('divCaseAppointment').classList.add('hidden');
    }
    if (document.getElementById('divOAGNotes')) {
        document.getElementById('divOAGNotes').classList.add('hidden');
    }
    if (document.getElementById('divSendDocToLicensee')) {
        document.getElementById('divSendDocToLicensee').classList.add('hidden');
    }
}

function CaseOAGNotes() {

    ShowHideCaseOAGSection(true);

    if (document.getElementById('divOAGNotes')) {
        document.getElementById('divOAGNotes').classList.remove('hidden');
    }
    if (document.getElementById('addOAG_editor')) {
        document.getElementById('addOAG_editor').classList.add('hidden');
    }
    if (document.getElementById('addOAGNotes_view')) {
        document.getElementById('addOAGNotes_view').classList.remove('hidden');
    }

    bindOAGNotesGrid();
}
function view_OAG_Notes() {
    document.getElementById('view_OAGNotesTitle').innerHTML = 'OAG Notes';
    document.getElementById('addOAG_editor').classList.add("hidden");
    document.getElementById('OAGNotesGrid').classList.remove('hidden');
    //document.getElementById('notesHeader').classList.remove("hidden");
    document.getElementById('addOAGNotes_view').classList.remove('hidden');
    selectedOAGNoteId = 0;
}

function cancelOAGNotesAction() {
    ShowHideCaseOAGSection(false);

}
function redirect_AddOAGNotes() {
    document.getElementById('OAGNotesForm').reset();
    document.getElementById('view_OAGNotesTitle').innerHTML = 'Add OAG Notes';
    document.getElementById('addOAG_editor').classList.remove("hidden");
    document.getElementById('OAGNotesGrid').classList.add('hidden');
    document.getElementById('addOAGNotes_view').classList.add('hidden');
    document.getElementById('OAGNotesGrid').classList.remove("k-grid-display-block");
    selectedNoteId = 0;
    var editor = $("#OAG_Comments").data("kendoEditor");
    editor.value('');
    $("#txt_LegalOAGTitle").val('');
    selectedOAGNoteId = 0;


}

function saveOAGNotes() {

    //if (recordId == 0) return;
    var isError = false;

    var oAGTitleInput = $('#txt_LegalOAGTitle').val();
    var oAGcomment = $("#OAG_Comments").val();
    oAGcomment = sanitizeHtml(oAGcomment);
    oAGcomment = removeSpecialCharacters(oAGcomment);

    if (oAGTitleInput == "") {
        document.getElementById('err_oagTitle').classList.remove('hidden');
        isError = true;
    } else {
        document.getElementById('err_oagTitle').classList.add('hidden');
    }


    if (isError) return;

    var oASNotesRequest = new Object();
    oASNotesRequest.ItemID = $('#hdnApplicationId').val();
    oASNotesRequest.WorkItemID = $("#hdnWorkItemID").val();
    oASNotesRequest.WorkItemType = "LEG";
    oASNotesRequest.OAGComments = oAGcomment;
    oASNotesRequest.OAGTitle = oAGTitleInput;
    oASNotesRequest.OAGNoteID = selectedOAGNoteId;
    oASNotesRequest.DateCreated = new Date().toLocaleString();

    $.ajax({
        type: "POST",
        url: "/Process/SaveOAGNotes",
        contentType: "application/json",
        data: JSON.stringify(oASNotesRequest),
        success: function (data) {
            
            if (data == 'error') {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "Something went wrong, please try again." }, "error");
            }
            else {
                var popupNotification = $("#Notification").data("kendoNotification");
                if (oASNotesRequest.OAGNoteID == 0) {
                    popupNotification.show({ message: "OAG Notes added successfully." }, "success");
                }
                else { popupNotification.show({ message: "OAG Notes updated successfully." }, "success"); }
                bindOAGNotesGrid();
                document.getElementById('OAGNotesForm').reset();
                document.getElementById('view_OAGNotesTitle').innerHTML = 'OAG Notes';
                document.getElementById('addOAG_editor').classList.add("hidden");
                document.getElementById('OAGNotesGrid').classList.remove('hidden');
                document.getElementById('addOAGNotes_view').classList.remove('hidden');
                $('#OAG_Comments').data('kendoEditor').value(null);
            }
        },
        error: function (objError) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Error adding OAG Notes" }, "error");
        }
    });
}

function bindOAGNotesGrid() {
    var ItemID = $('#hdnApplicationId').val();
    var WorkItemType = "LEG";

    var workItemId = -1;
    if ($('#hdnWorkItemID').length) {
        workItemId = $("#hdnWorkItemID").val();
    }


    $.ajax({
        type: "GET",
        url: "/Process/GetOAGNotes?recordId=" + ItemID + "&recordType=LEG" + "&workItemId=" + workItemId,
        contentType: "json",
        dataType: "json",
        success: function (results) {
            HideLoader();

            if (results.length > 0) {

                $("#OAGNotesGrid").kendoGrid({
                    toolbar: ["excel"],
                    excel: {
                        fileName: "OAGNotes.xlsx",
                        allPages: true,
                    },
                    dataSource: {
                        data: results,
                        schema: {
                            model: {
                                fields: {
                                    OAGTitle: { type: "string" },
                                    CreatedBy: { type: "string" },
                                    DateCreated: { type: "date" },
                                    OAGComments: { type: "string" },
                                    OAGNoteID: { type: "number" },
                                    strDateCreated: { type: "string" }
                                }
                            }
                        },
                        pageSize: 5
                    },
                    scrollable: true,
                    sortable: true,
                    selectable: "row",
                    //change: onNotesRowSelected,
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
                        { field: "OAGNoteID", title: "Note Id", width: 60, hidden: true },
                        { field: "OAGTitle", title: "Title", width: 120 },
                        { field: "CreatedBy", title: "Added by", width: 120 },
                        //{ field: "DateCreated", title: "Date", width: 130, format: "{0:MM/dd/yyyy}" },
                        { field: "strDateCreated", title: "Date", width: 130 },
                        {
                            field: "OAGComments", title: "Notes", width: 180, template: "<div style='white-space:normal;word-break: break-all;'>#= stripHtmlTags(OAGComments) #</div>"

                        },

                        {
                            //template: function (dataItem) {
                            //    let actionTemplate = '';
                            //    if (getClosedCaseValue() != 'Yes' && getViewAccess() == 'No' && results.IsEditable)
                            //        actionTemplate += '<a onclick="openEditOAGNotes(' + dataItem.OAGNoteID + ')"><i class="ion-edit"></i></a>&nbsp;&nbsp;<a  onclick="DeleteOAGNotes(' + dataItem.OAGNoteID + ')"  ><i class="text-danger k-icon k-i-delete"></i></a>';
                            //    return actionTemplate;
                            //},
                            template: "<a onclick=\"openEditOAGNotes(\'#=OAGNoteID#\')\"><i class='ion-edit'></i></a>&nbsp;&nbsp;<a  onclick=\"DeleteOAGNotes(\'#=OAGNoteID#\')\"  ><i class='text-danger k-icon k-i-delete'></i></a>",


                            field: "OAGNoteID",
                            filterable: false,
                            sortable: false,
                            width: 100,
                            hidden: isClosed(),
                            title: "Actions",
                            headerAttributes: { style: "color: #333; font-size: 15px; font-weight: 600; text-decoration: none;" }
                        }
                    ]
                });

            }
            else {
                //  document.getElementById('notesHeader').classList.remove('hidden');
                //  document.getElementById('addNotes_view').classList.remove('hidden');
                var popupNotification = $("#Notification").data("kendoNotification");
                // popupNotification.show({ message: "No notes are found on this " + $("#RecordType").val() }, "warning");
                if ($('#divNoRecordFoundMessage').length) {
                    const workItemTypeName = getWorkItemTypeNameForWarningMessage();
                    disPlayNotExistMessage(`No notes are found on this ${workItemTypeName}.`);
                }

                HideLoader();
                if (document.getElementById('OAGNotesGrid') != null) {
                    document.getElementById('OAGNotesGrid').classList.add('hidden');
                }


            }
        }



    });

}
function openEditOAGNotes(OAGNoteId) {

    if (confirm("Are you sure to edit this OAG Note?")) {
        selectedOAGNoteId = OAGNoteId;
        isEdit = true;
        EditOAGNotes(OAGNoteId);
    }
    else { isEdit = false; }
}
function EditOAGNotes(OAGNoteId) {
    var itemId = 0;
    var record_Type = null;
    var _record_TypeId = 0;
    var workItemId = -1;

    $.ajax({
        type: "GET",
        url: "/Process/GetOAGNotes?recordId=" + itemId + "&recordType=LEG" + "&workItemId=" + workItemId + "&oAGNoteId=" + OAGNoteId,
        dataType: "json",
        success: function (results) {
            document.getElementById('view_OAGNotesTitle').innerHTML = 'Edit OAG Notes';
            document.getElementById('addOAG_editor').classList.remove("hidden");
            document.getElementById('OAGNotesGrid').classList.remove("k-grid-display-block");
            document.getElementById('OAGNotesGrid').classList.add('hidden');
            document.getElementById('addOAGNotes_view').classList.add('hidden');
            editOAGNotesMasterData(results[0])
        },
        error: function (xhr) {

        },
    });


}
function editOAGNotesMasterData(data) {
    //document.getElementById("previewNotes_Id").innerHTML = $("#RecordId").val();

    $('#txt_LegalOAGTitle').val(data.OAGTitle);

    // Get the Kendo UI Editor element
    var editor = $("#OAG_Comments").data("kendoEditor");
    editor.value(stringDataToHTML(data.OAGComments));

}

function DeleteOAGNotes(OAGNoteID) {

    isDelete = true;
    if (confirm("Are you sure to delete this Note?")) {

        $.ajax({
            type: "POST",
            //data: { "NoteID": OAGNoteID },
            url: "/Process/DeleteOAGNotesByNoteID?oAGNoteID=" + OAGNoteID + "&itemID=" + $('#hdnApplicationId').val() + "&itemType=LEG",
            //dataType: "json",
            success: function (data) {
                if (data == 'error') {
                    var popupNotification = $("#Notification").data("kendoNotification");
                    popupNotification.show({ message: "Something went wrong, please try again." }, "error");
                }
                else {
                    var popupNotification = $("#Notification").data("kendoNotification");
                    popupNotification.show({ message: "Note has been deleted." }, "success");
                    bindOAGNotesGrid();
                }
            },
            error: function (objError) {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
                isDelete = false;
            }
        });

    }
    else {
        isDelete = false;
    }
}


function stringDataToHTML(str) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(str, 'text/html');
    return doc.body.innerText;
};


function ShowHideCaseSection(flag, edit = '') {
    $('#viewDispositionRecommendationIDAppointment').html($('#hdnApplicationId').val());
    if (flag == true) {
        if (edit == '') {
            var editor = $("#Appointment_Comment").data("kendoEditor");
            editor.value('');
            $("#dis_selectCaseAppointmentType").val('-1');
            $("#txtAppointmentDate").val('');
        }
        $('#legalReadOnlyDetails').hide();
        //$('#divCaseAppointment').show();
        if (document.getElementById('divCaseAppointment')) {
            document.getElementById('divCaseAppointment').classList.remove('hidden');
        }
    } else {
        var editor = $("#Appointment_Comment").data("kendoEditor");
        editor.value('');
        $('#legalReadOnlyDetails').show();
        previewLegalInvCaseOverviewInformation_ReadOnly();
        if (document.getElementById('divCaseAppointment')) {
            document.getElementById('divCaseAppointment').classList.add('hidden');
        }
        $('#selectCaseActions1').val("none");
    }
    if (document.getElementById('divUpdateLegalAction')) {
        document.getElementById('divUpdateLegalAction').classList.add('hidden');
    }

}

function ShowHideCaseOAGSection(flag, edit = '') {
    $('#viewDispositionRecommendationIDOAGNotes').html($('#hdnApplicationId').val());
    if (flag == true) {
        if (edit == '') {
            var editor = $("#OAG_Comments").data("kendoEditor");
            editor.value('');
            $("#txt_LegalOAGTitle").val('');
        }
        $('#legalReadOnlyDetails').hide();
        //$('#divCaseAppointment').show();
        if (document.getElementById('divOAGNotes')) {
            document.getElementById('divOAGNotes').classList.remove('hidden');
        }
    } else {
        var editor = $("#OAG_Comments").data("kendoEditor");
        editor.value('');
        $('#legalReadOnlyDetails').show();
        previewLegalInvCaseOverviewInformation_ReadOnly();
        if (document.getElementById('divOAGNotes')) {
            document.getElementById('divOAGNotes').classList.add('hidden');
        }
        $('#selectCaseActions1').val("none");
    }
    if (document.getElementById('divUpdateLegalAction')) {
        document.getElementById('divUpdateLegalAction').classList.add('hidden');
    }

}


function cancelAppointmentAction() {
    ShowHideCaseSection(false);
}

function submitCaseAppointment(isUpdate = 0) {
    var isError = false;
    var appointmentId = 0;
    if (isUpdate == 1) {
        appointmentId = $("#hdnAppointmentId").val();
    }

    var appointmentTypeId = $("#dis_selectCaseAppointmentType option:selected").val();
    var appointmentDate = $("#txtAppointmentDate").val();
    var comment = $("#Appointment_Comment").val();
    comment = sanitizeHtml(comment);
    comment = removeSpecialCharacters(comment);


    var pattern = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/;
    // var pattern = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
    var isValidDate = pattern.test(appointmentDate);

    var workitemId = $("#hdnWorkItemID").val();

    if (appointmentDate == "" || appointmentDate == "01/01/0001" || isValidDate == false) {
        document.getElementById('err_AppointmentDate').classList.remove('hidden');
        isError = true;
    }
    else {
        document.getElementById('err_AppointmentDate').classList.add('hidden');
    }

    if (appointmentTypeId == "-1" || appointmentTypeId == "Select") {
        document.getElementById('err_appointmentType').classList.remove('hidden');
        isError = true;
    }
    else {
        document.getElementById('err_appointmentType').classList.add('hidden');
    }

    //if (comment == "") {
    //    document.getElementById('err_AppointmentComment').classList.remove('hidden');
    //    isError = true;
    //}
    //else {
    //    document.getElementById('err_AppointmentComment').classList.add('hidden');
    //}

    if (isError) return;

    var paramObject = new Object();
    paramObject.AppointmentId = appointmentId;
    paramObject.CaseId = $('#hdnApplicationId').val();
    paramObject.WorkItemID = workitemId;
    //paramObject.WorkItemTypeId = workItemTypeID;
    paramObject.AppointmentTypeId = appointmentTypeId;
    paramObject.Comment = comment;
    paramObject.AppointmentDate = appointmentDate;

    $.ajax({
        type: "POST",
        url: "/Process/SaveAppointment",
        data: JSON.stringify(paramObject),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            if (data == 'error') {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "Something went wrong, please try again." }, "error");
            }
            else {
                getCaseAppointmentList();
                //ShowHideCaseSection(false);
                //previewLegalInvCaseOverviewInformation_ReadOnly();
                var popupNotification = $("#Notification").data("kendoNotification");
                if (appointmentId > 0) {
                    popupNotification.show({ message: "Milestone updated successfully." }, "success");
                }
                else {
                    popupNotification.show({ message: "Milestone submitted successfully." }, "success");
                }
            }
        },
        error: function () {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went wrong, please try again." }, "error");
        }
    });
}

function EditAppointment(appointmentId, appointmentTypeId, appointmentDate, comment) {
    $("#hdnAppointmentId").val(appointmentId);
    ShowHideCaseSection(true, 'edit');
    $("#dis_selectCaseAppointmentType").val(appointmentTypeId);
    $("#txtAppointmentDate").val(appointmentDate);
    $("#Appointment_Comment").val(comment);
}

function updateCaseActions(status) {
    $("#selectLegalCaseActions1").find("option[value='share']").hide();
    $("#selectLegalCaseActions1").find("option[value='editCase']").hide();
    $("#selectLegalCaseActions1").find("option[value='appointment']").hide();
    $("#selectLegalCaseActions1").find("option[value='viewcaseSummary']").hide();

    switch (status) {
        case 'Hearing Requested':
            $("#selectLegalCaseActions1").find("option[value='share']").show();
            $("#selectLegalCaseActions1").find("option[value='editCase']").show();
            $("#selectLegalCaseActions1").find("option[value='appointment']").show();
            $("#selectLegalCaseActions1").find("option[value='viewcaseSummary']").show();
            break;
        default: $("#selectLegalCaseActions1").find("option[value='share']").show();
            $("#selectLegalCaseActions1").find("option[value='editCase']").show();
            $("#selectLegalCaseActions1").find("option[value='viewcaseSummary']").show();
            break;
    }
}

// #Region // Case Investigation Non-Disclosure Order
function fn_get_Case_NonDisclosureOrder(isExpUser = false) {
    var id_value = $("#hdnApplicationId").val();
    let requestObj = new Object();
    requestObj.Id = id_value;
    requestObj.WorkItemType = "CAS";
    fn_Get_NonDisclosureOrder(requestObj, isExpUser);
}
function fn_Update_Case_NonDisclosureOrder(isNdoType) {
    //var dv_DdlObj = document.getElementById("selectCaseActions1");
    var id_value = $("#hdnApplicationId").val();
    let updateRequest = new Object();
    updateRequest.Id = id_value;
    updateRequest.WorkItemType = "CAS";
    if (isNdoType == 'add') {
        updateRequest.IsNDO = true;
        isNDOExists = true;
        showNDO(itemEditMode);
        GetNDODetailsById(selectedInvestigationId, "INV", 2);
    } else if (isNdoType == 'remove') {
        updateRequest.IsNDO = false;
        isNDOExists = false;
        hideNDO();

    }
    //if (isNdoType == 'remove') {
    //    if (!confirm('Are you sure to Remove?')) { dv_DdlObj.selectedIndex = 0; return; }
    //}
    fn_Update_NonDisclosureOrder(updateRequest);
}

function fn_ShowOrHide_Case_Dll_Options(isNdo, isExpUser = false) {
    var dv_ndo_MsgObj = document.getElementById("dv_Case_ndoMsg");
    var ddlActionsObj = document.getElementById("selectCaseActions1");
    if (isExpUser === true) {
        if (isNdo === true) {
            //dv_ndo_MsgObj.classList.remove('hidden');
            $("#selectCaseActions1 option[value= 'addNDO']").hide();
            $("#selectCaseActions1 option[value= 'removeNDO']").show();
        } else {
            //dv_ndo_MsgObj.classList.add('hidden');
            $("#selectCaseActions1 option[value= 'addNDO']").show();
            $("#selectCaseActions1 option[value= 'removeNDO']").hide();
        }
    }
    ddlActionsObj.selectedIndex = 0;

    if (isNdo === true) {
        dv_ndo_MsgObj.classList.remove('hidden');
    } else {
        dv_ndo_MsgObj.classList.add('hidden');
    }
}
// #EndRegion
function viewLicenseInformation(licenseID) {
    window.open("/Licensing/GeneratePublicUserLicenseInformationToken?LicenseID=" + licenseID, target = "_blank");
}
function viewCaseWorkflow() {
    // 
    ShowLoader();
    var workItemId = $("#viewLegalCaseId").text();
    var workItemType = "CAS";
    if (workItemType == null || workItemId == null) return;

    $.ajax({
        type: "GET",
        url: "/Enforcement/GetCASByIDDetails?workItemId=" + workItemId + "&workItemType=" + workItemType,
        dataType: "json",
        success: function (data) {
            // 
            HideLoader();
            if (data != null) {
                
                window.open("/process/InvCaseworkflow?WorkitemID=" + data.WorkItemID + "&WorkitemTypeID=" + data.WorkitemTypeID + "&WorkitemType=" + workItemType + "&ApplicationID=" + data.ItemID, target = "_blank");
            }
        }
    });
}
function SubmitLegalDisAdminSettlementFromDoc() {
    /*Start Validations*/
    var isError = false;
    var regex = /^[A-Za-z0-9,. ]+$/;
    var regexnum = /^[0-9]+$/;
    var regexDollor = /(?=.*?\d)^\$ ? (([1 - 9]\d{ 0, 2 } (, \d{ 3 })*)|\d +)?(\.\d{ 1, 2 })?$/;
    if ($('#ddl_SettlementType').find(":selected").val() == -1) {
        document.getElementById('err_legal_responseAdminSettlementType').classList.remove('hidden');
        isError = true;
    }
    else {
        document.getElementById('err_legal_responseAdminSettlementType').classList.add('hidden');
    }

    //if ($("#attachment").data("kendoUpload").getFiles().length == 0 ) {
    //    document.getElementById('err_legal_lblAttachment').classList.remove('hidden');
    //    isError =true;
    //}
    //else {
    //    document.getElementById('err_legal_lblAttachment').classList.add('hidden');
    //}

    if ($('#dis_ddlLegalAdminSettlementPelalityList').find(":selected").val() == -1) {
        document.getElementById('err_legal_responseAdminPenalityType').classList.remove('hidden');
        isError = true;
    }
    else {
        document.getElementById('err_legal_responseAdminPenalityType').classList.add('hidden');
    }

    if ($("#legalResponseDueDate").is(":visible") && $("#dis_legalResponseDueDate").val() == "") {
        document.getElementById('err_legal_responseDue').classList.remove('hidden');
        document.getElementById('err_legal_sameResponseDueValidate').classList.add('hidden');
        isError = true;
    } else {
        document.getElementById('err_legal_responseDue').classList.add('hidden');
    }


    if ($("#legalResponseFollowUp").is(":visible") && $("#dis_legalResponseFollowUpDate").val() == "") {
        document.getElementById('err_legal_responseFollowup').classList.remove('hidden');
        document.getElementById('err_legal_sameResponseInputFollowUp').classList.add('hidden');
        isError = true;
    } else {
        if ($("#legalResponseDueDate").is(":visible") && $("#legalResponseFollowUp").is(":visible")) {
            if (new Date($("#dis_legalResponseFollowUpDate").val()) > new Date($("#dis_legalResponseDueDate").val())) {
                document.getElementById('err_legal_followUpgreaterThanValidate').classList.remove('hidden');
                isError = true;
            } else {
                document.getElementById('err_legal_responseFollowup').classList.add('hidden');
                document.getElementById('err_legal_followUpgreaterThanValidate').classList.add('hidden');
            }
        }
    }

    if ($("#divLegalSuspensionInputs").is(":visible") && $("#dis_LegalSuspensionStartDate").val() == "") {
        document.getElementById('err_legal_responseSuspensionStart').classList.remove('hidden');
        isError = true;
    } else {
        document.getElementById('err_legal_responseSuspensionStart').classList.add('hidden');
    }
    if (($("#divLegalSuspensionInputs").is(":visible") && $("#legalResponseDueDate").is(":visible") && $("#legalResponseFollowUp").is(":visible")) && (new Date($("#dis_legalResponseFollowUpDate").val()) > new Date($("#dis_legalResponseDueDate").val()))) {
        document.getElementById('err_legal_responseDueValidate').classList.remove('hidden');
        document.getElementById('err_legal_sameResponseDueValidate').classList.add('hidden');
        isError = true;
    } else {
        document.getElementById('err_legal_responseDueValidate').classList.add('hidden');
    }

    if (($("#divLegalSuspensionInputs").is(":visible") && $("#legalResponseFollowUp").is(":visible")) && (new Date($("#dis_legalResponseFollowUpDate").val()) > new Date($("#dis_LegalSuspensionStartDate").val()))) {
        document.getElementById('err_legal_responseFollowup').classList.remove('hidden');
        document.getElementById('err_legal_sameResponseInputFollowUp').classList.add('hidden');
        isError = true;
    } else {
        document.getElementById('err_legal_sameResponseInputFollowUp').classList.add('hidden');
    }
    if (($("#divLegalSuspensionInputs").is(":visible") && $("#legalResponseDueDate").is(":visible")) && ($("#dis_legalResponseDueDate").val() != "" && $("#dis_LegalSuspensionStartDate").val() != "")) {
        if ($("#dis_legalResponseDueDate").val() == $("#dis_LegalSuspensionStartDate").val()) {
            document.getElementById('err_legal_sameResponseDueValidate').classList.remove('hidden');
            document.getElementById('err_legal_responseDueValidate').classList.add('hidden');
            isError = true;
        } else {
            document.getElementById('err_legal_sameResponseDueValidate').classList.add('hidden');

        }
    }
    if (($("#divLegalSuspensionInputs").is(":visible") && $("#legalResponseFollowUp").is(":visible")) && ($("#dis_legalResponseFollowUpDate").val() != "" && $("#dis_LegalSuspensionStartDate").val() != "")) {
        if ($("#dis_legalResponseFollowUpDate").val() == $("#dis_LegalSuspensionStartDate").val()) {
            document.getElementById('err_legal_sameResponseInputFollowUp').classList.remove('hidden');
            document.getElementById('err_legal_responseInputFollowUp').classList.add('hidden');
            isError = true;
        } else {
            document.getElementById('err_legal_sameResponseInputFollowUp').classList.add('hidden');
        }
    }
    if ($('#divLegalPenaltyInput').is(":visible")) {
        if ($("#inv_legalPenalityAmount").val() == "") {
            document.getElementById('err_legal_responsePenalityAmount').classList.remove('hidden');
            document.getElementById('formatErr_legal_responsePenalityAmountOther').classList.add('hidden');
            isError = true;
        } else if ($("#inv_legalPenalityAmount").val().replace(/\s+/g, '') == "" || !regex.test($("#inv_legalPenalityAmount").val())) {
            document.getElementById('err_legal_responsePenalityAmount').classList.add('hidden');
            document.getElementById('formatErr_legal_responsePenalityAmountOther').classList.remove('hidden');
            isError = true;
        } else {
            document.getElementById('err_legal_responsePenalityAmount').classList.add('hidden');
            document.getElementById('formatErr_legal_responsePenalityAmountOther').classList.add('hidden');
        }
    }

    if (($("#divLegalSuspensionInputs").is(":visible") && $("#divLegSuspensionDays").is(":visible")) && $("#inv_legalNumSusPensionDays").val() == "") {
        document.getElementById('err_legal_responseSuspensionDays').classList.remove('hidden');
        document.getElementById('formatErr_legal_suspensionDaysOther').classList.add('hidden');
        isError = true;
    } else {
        document.getElementById('err_legal_responseSuspensionDays').classList.add('hidden');
        document.getElementById('formatErr_legal_suspensionDaysOther').classList.add('hidden');
    }

    if (($("#divLegalSuspensionInputs").is(":visible") && $("#divLegSuspensionDays").is(":visible")) && (ValidateSuspensionStartOverlappingDate($("#dis_LegalSuspensionStartDate").val(), $("#inv_legalNumSusPensionDays").val(), caseId, 0, true))) {
        document.getElementById('err_legal_suspensionOverlappingDateValidate').classList.remove('hidden');
        isError = true;
    } else {
        document.getElementById('err_legal_suspensionOverlappingDateValidate').classList.add('hidden');
    }



    if (isError) return;

    /*End validations*/
    var model = new Object();
    model.DispositionRecommendationId = caseId;
    model.Violations = adminSettlementViolations;
    model.PenaltyTypeID = $('#dis_ddlLegalAdminSettlementPelalityList').find(":selected").val();
    model.ResponseDue = $("#dis_legalResponseDueDate").val();
    model.ResponseFollowUp = $("#dis_legalResponseFollowUpDate").val();
    model.MonetaryAmount = $("#inv_legalPenalityAmount").val();
    model.SuspensionDays = $("#inv_legalNumSusPensionDays").val();
    model.SuspensionStart = $("#dis_LegalSuspensionStartDate").val();
    const workItem = getReqWorkItemType();// getWorkItemType();
    model.ReferenceItemID = workItem.ItemId;
    model.ReferenceItemTypeID = workItem.ItemTypeId;
    model.AdminSettlementId = $("#SettlementId").val();
    model.IsLegalSettlement = true;
    //model.UploadedFiles = $("#attachment").data("kendoUpload").getFiles();//EGIS-1472
    model.CaseTypeId = $('#hdnCaseTypeId').val();
    model.WorkItemId = $("#hdnWorkItemID").val();

    
    var validateViolationAssociation = false;
    var validateViolationAssociation = ValidateCaseSettementAssociatedViolations(model.DispositionRecommendationId, model.Violations[0].ViolationId, workItem.Code);

    if (validateViolationAssociation)
        return true;

    /*
    if ($("#attachment").data("kendoUpload").getFiles().length > 0) {
        var fileRequest = new FormData();
        for (var i = 0; i < $("#attachment").data("kendoUpload").getFiles().length; i++) {
            fileRequest.append('RequestFiles', $("#attachment").data("kendoUpload").getFiles()[i].rawFile)
        }
    }
    
   // model.RequestFiles = fileRequest;// $("#attachment").data("kendoUpload").getFiles()[0].rawFile;
    $.ajax({
        type: "POST",
        enctype: 'multipart/form-data',
        url: "/Enforcement/UploadEnforcementFiles?uploadReason=" + "Activity file upload",
        data: fileRequest,
        processData: false,
        contentType: false,
        cache: false,
        timeout: 600000,
        success: function (result) {
            //createRequest.IsFileUploaded = true;
            model.Files = result;
            
        },
        error: function (objError) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Error uploading file on investigation." }, "error");
        }
    });
    */
    $.ajax({
        type: "POST",
        url: "/Process/CreateLegalAdminSettlement",
        contentType: "application/json",
        data: JSON.stringify(model),
        success: function (data) {
            var popupNotification = $("#Notification").data("kendoNotification");
            if (data) {
                popupNotification.show({ message: "Request processed successfully." }, "success");
                //resetEditDisAdminSettlementPenalty();
                //$("#dvSettlementDocument").removeClass("hidden");
                //$("#dvMainSettelementView").removeClass("hidden");
                //$("#dvSettlementGrid").addClass("hidden");
                //$("#dvbtnAddNewSettlement").addClass("hidden");


                //ShowSettlementDocumentSection($("#SettlementId").val(), $("#CaseId").val(), $('#hdnCaseTypeId').val(), $("#DocumentType").val(), $("#SettlementDocumentAction").val());                previewSettlementByCaseId(caseId);
                ////RenderMenuPartialView('Settlement');
                // $("#SettlementId").val(data);
                previewSettlementData(data, "Administrative Case", $("#Case_Id").val());

            }
            else
                popupNotification.show({ message: "Error while processing request" }, "error");
        },
        error: function (objError) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Error while processing request" }, "error");
        }
    });
}

function fn_get_LegalCase_NonDisclosureOrder(isExpUser = false) {
    var id_value = $("#hdnApplicationId").val();
    let requestObj = new Object();
    requestObj.Id = id_value;
    requestObj.WorkItemType = "LEG";
    fn_Get_NonDisclosureOrder(requestObj, isExpUser);
}
function fn_Update_LegalCase_NonDisclosureOrder(isNdoType) {
    //var dv_DdlObj = document.getElementById("selectCaseActions1");
    var id_value = $("#hdnApplicationId").val();
    let updateRequest = new Object();
    updateRequest.Id = id_value;
    updateRequest.WorkItemType = "LEG";
    if (isNdoType == 'add') {
        updateRequest.IsNDO = true;
        isNDOExists = true;
        showNDO(true);
        GetNDODetailsById(id_value, "LEG", 15);
    } else if (isNdoType == 'remove') {
        updateRequest.IsNDO = false;
        isNDOExists = false;
        hideNDO();

    }
    //if (isNdoType == 'remove') {
    //    if (!confirm('Are you sure to Remove?')) { dv_DdlObj.selectedIndex = 0; return; }
    //}
    fn_Update_NonDisclosureOrder(updateRequest);
}

function fn_ShowOrHide_LegalCase_Dll_Options(isNdo, isExpUser = false) {
    var dv_ndo_MsgObj = document.getElementById("dv_LegalCase_ndoMsg");
    var ddlActionsObj = document.getElementById("selectLegalCaseActions1");
    var tbl_report_ndolegal = document.getElementById("tbl_report_ndolegal");
    if (isExpUser === true) {
        if (isNdo === true) {
            //dv_ndo_MsgObj.classList.remove('hidden');
            $("#selectLegalCaseActions1 option[value= 'addNDO']").hide();
            $("#selectLegalCaseActions1 option[value= 'removeNDO']").show();
        } else {
            //dv_ndo_MsgObj.classList.add('hidden');
            $("#selectLegalCaseActions1 option[value= 'addNDO']").show();
            $("#selectLegalCaseActions1 option[value= 'removeNDO']").hide();
        }
    }
    ddlActionsObj.selectedIndex = 0;

    if (isNdo === true) {
        dv_ndo_MsgObj.classList.remove('hidden');
        if (tbl_report_ndolegal)
            tbl_report_ndolegal.classList.remove('hidden');
    } else {
        dv_ndo_MsgObj.classList.add('hidden');
        if (tbl_report_ndolegal)
            tbl_report_ndolegal.classList.add('hidden');
    }
}


function updatelegalNDOAttachment() {
    var itemid = $("#hdnApplicationId").val()
    UpdateNDOAttachment(itemid, "LEG", 15);
}

//======EGIS-1621=======
function previewCaseWarnings() {
    ShowLoader();
    $.ajax({
        type: "GET",
        url: "/Process/GetViolationsByDispositionRecommendationID?dispositionRecommendationId=" + caseId,
        dataType: "json",
        success: function (data) {
            violations = data;
            $.ajax({
                type: "GET",
                url: "/Process/GetCaseWarnings",
                data: { "caseId": caseId, "caseTypeId": $("#hdnCaseTypeId").val(), "licenseId": licNumber },
                success: function (data) {
                    if (data != null) {
                        hideAllPartialViews('caseWarningPartialView');
                        $("#caseWarningPartialView").html(data);
                        /*previewSettlementByCaseId(caseId, isLegal);*/
                        /*setTimeout(HideLoader, 500);*/
                        CaseSearchWarningResult();

                    }
                    else {
                        var popupNotification = $("#Notification").data("kendoNotification");
                        popupNotification.show({ message: "No record was found." }, "warning");
                    }
                },
                error: function (xhr) {
                    var popupNotification = $("#Notification").data("kendoNotification");
                    popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
                },
            });

        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went wrong. Please try again." }, "error");
        }
    });
}

function redirectToCreateCaseWarning(fromBack = 0) {
    if (fromBack == 0) {
        newWarningId = 0;
    }
    CreateCaseWarning();
}

function CreateCaseWarning(fromEdit = 0) {
    //var warnId = newWarningId;
    $.ajax({
        type: "GET",
        url: "/Enforcement/CreateCaseWarning?caseID=" + caseId,
        success: function (data) {
            if (data != null) {
                hideAllDivs('create-activity');
                hideAllPartialViews('createCaseWarningPartialView');
                $("#createCaseWarningPartialView").html(data);
                //AssignInvestigationDataById("createcasewarning");
                getInvestigatorsByCaseId();
                loadDisViolationDropdowns();
                hideMobileSidebar();
                getCaseActivityAssociationLists();

                if (data.ActivityDivisionId > 0) {
                    activityDivisionId = data.ActivityDivisionId;
                    getActivityClasses(activityDivisionId);

                }

                if (data.ActivityClassId > 0) {
                    activityClassId = data.ActivityClassId;
                    getActivityLists(activityClassId);
                }
                //$('#dis_AdministrativeNoticeNumber').val(adminNoticeNumber); //EGIS-1621
                if (fromEdit == 1) { loadWarningDetails(selectedWarningId); }


                //previewActivityAssociatedPersons();
                //<End>Added for ILA - Enfrorcement - Page Load Chnages

                //$('#invNarrative').data('kendoEditor').value(stringToHTML(data.Narrative));
            }
            else {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "No record was found." }, "warning");
            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        },
    });
}

function previewCaseSearchWarning() {
    CaseSearchWarning();
}

function CaseSearchWarningResult() {
    var _url = "/Enforcement/GetCaseWarnings?caseID=" + caseId;

    $.ajax({
        type: "GET",
        url: _url,
        dataType: "json",
        success: function (results) {
            $("#caseWarningsResult").empty();
            if (document.getElementById('viewCaseWarningResults') != null) { document.getElementById('viewCaseWarningResults').classList.remove('hidden') };
            if (results.length > 0) {
                for (var i = 0; i < results.length; i++) {
                    results[i].WarningStartDateTime = new Date(results[i].strActivityStartTime);
                    results[i].WarningEndDateTime = new Date(results[i].strActivityEndTime);
                    results[i].DateCreated = new Date(results[i].strDateCreated);
                }
                $("#caseWarningsResult").kendoGrid({
                    toolbar: ["excel"],
                    excel: {
                        fileName: "CaseWarnings.xlsx",
                        allPages: true,
                    },
                    dataSource: {
                        data: results,
                        schema: {
                            model: {
                                fields: {
                                    WarningID: { type: "number" },
                                    SubjectId: { type: "number" },
                                    CreatedBy: { type: "string" },
                                    DateCreated: { type: "date" },
                                    ActivityStartDateTime: { type: "date" },
                                    ActivityEndDateTime: { type: "date" },
                                    ActivityClass: { type: "string" },
                                    Activity: { type: "string" },
                                    Notes: { type: "string" },
                                    FileID: { type: "number" },
                                    FileName: { type: "string" },
                                    Violation: { type: "string" },
                                    strViolationDate: { type: "string" },
                                    AdminNoticeNumber: { type: "string" },
                                    strNoticeIssueDate: { type: "string" },
                                }
                            }
                        },
                        pageSize: 10
                    },
                    scrollable: true,
                    sortable: true,
                    pageable:
                    {
                        pageSizes: true,
                        buttonCount: 3
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
                        { field: "WarningID", title: "Warning ID", width: 130, template: "<a href='\\#' class='link' onclick='previewCaseWarningDataById(\"#=WarningID#\")'>#=WarningID#</a>" },
                        { field: "CreatedBy", title: "Added by", width: 130, hidden: "true" },
                        { field: "SubjectId", title: "Subject ID", width: 130 },
                        { field: "DateCreated", title: "Date Created", width: 130, hidden: "true", format: "{0:MM/dd/yyyy}" },
                        //{ field: "ActivityStartDateTime", title: "Start Date", width: 130, format: "{0:MM/dd/yyyy}" },
                        //{ field: "ActivityEndDateTime", title: "End Date", width: 130, format: "{0:MM/dd/yyyy}" },
                        //{ field: "ActivityClass", title: "Class", width: 130 },
                        //{ field: "Activity", title: "Activity", width: 200 },
                        { field: "Violation", title: "Violation", width: 200 },
                        { field: "strViolationDate", title: "Violation Date", width: 130, format: "{0:MM/dd/yyyy hh:mm tt}" },
                        { field: "strNoticeIssueDate", title: "Notice Issue Date", width: 130, format: "{0:MM/dd/yyyy hh:mm tt}" },
                        { field: "Notes", title: "Notes", width: 180, hidden: "true" },
                        { field: "FileID", title: "ID", hidden: "true" },
                        { field: "EncriptedFileId", title: "EncriptedFileId", hidden: "true", menu: false },
                        { field: "FileName", title: "Attachments", width: 100, hidden: "true", template: "<a href='/Enforcement/DownloadFile?FileID=\#=EncriptedFileId#\' target='_blank' class='link'>#=FileName#</a>" },
                        {
                            //template: "<a onclick=\"openEditCaseWarning(\'#=WarningID#\')\"><i class='ion-edit'></i></a>&nbsp;&nbsp;<a style='display: " + isClosed() + "' onclick=\"DeleteWarning(\'#=WarningID#\')\"  ><i class='text-danger k-icon k-i-delete'></i></a>",
                            template: function (dataItem) {
                                let actionTemplate = '';
                                if (getClosedCaseValue() != 'Yes' && getViewAccess() == 'No')
                                    actionTemplate += '<a onclick="openEditCaseWarning(' + dataItem.WarningID + ')"><i class="ion-edit"></i></a>&nbsp;&nbsp;<a  onclick="DeleteWarning(' + dataItem.WarningID + ')"  ><i class="text-danger k-icon k-i-delete"></i></a>';
                                return actionTemplate;
                            },
                            field: "WarningID",
                            filterable: false,
                            sortable: false,
                            width: 100,
                            title: "Actions",
                            hidden: isClosed() || getViewAccess() == 'Yes',
                            headerAttributes: { style: "color: #333; font-size: 15px; font-weight: 600; text-decoration: none;" }
                        }
                    ]
                });

                //////====<start> EGIS-170
                //if (($("#PrimaryStatus").val() === "Closed" || $("#PrimaryStatus").val() === "Suspended") && $("#HasExpungementPermission").val() === "false") {
                //    $("#createWarning").hide();
                //} else {
                //    $("#createWarning").show();
                //}
                //////====<end> EGIS-170
            }
            else {
                if ($('#divNoRecordFoundMessage').length) {
                    const workItemTypeName = getWorkItemTypeNameForWarningMessage();
                    const message = `No warnings are found on this ${workItemTypeName}.`;
                    disPlayNotExistMessage(message);
                }
            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        },
    });
    //$.ajax({
    //    type: "GET",
    //    url: "/Enforcement/CaseSearchWarning",
    //    async: false,
    //    success: function (data) {
    //        if (data != null) {
    //            //hideAllPartialViews('searchWarningPartialView');
    //            //$("#searchWarningPartialView").html(data);
    //            //hideAllDivs('search-warnings');
    //            //hideMobileSidebar();
    //            //if (selectedworkitemType == 'INV') {
    //            //    AssignInvestigationDataById();
    //            //}
    //            var _url = "/Enforcement/GetCaseWarnings?caseID=" + caseId;

    //            $.ajax({
    //                type: "GET",
    //                url: _url,
    //                dataType: "json",
    //                success: function (results) {
    //                    $("#caseWarningsResult").empty();
    //                    if (document.getElementById('viewCaseWarningResults') != null) { document.getElementById('viewCaseWarningResults').classList.remove('hidden') };
    //                    if (results.length > 0) {
    //                        for (var i = 0; i < results.length; i++) {
    //                            results[i].WarningStartDateTime = new Date(results[i].strActivityStartTime);
    //                            results[i].WarningEndDateTime = new Date(results[i].strActivityEndTime);
    //                            results[i].DateCreated = new Date(results[i].strDateCreated);
    //                        }
    //                        $("#caseWarningsResult").kendoGrid({
    //                            toolbar: ["excel"],
    //                            excel: {
    //                                fileName: "CaseWarnings.xlsx",
    //                                allPages: true,
    //                            },
    //                            dataSource: {
    //                                data: results,
    //                                schema: {
    //                                    model: {
    //                                        fields: {
    //                                            WarningID: { type: "number" },
    //                                            SubjectId: { type: "number" },
    //                                            CreatedBy: { type: "string" },
    //                                            DateCreated: { type: "date" },
    //                                            ActivityStartDateTime: { type: "date" },
    //                                            ActivityEndDateTime: { type: "date" },
    //                                            ActivityClass: { type: "string" },
    //                                            Activity: { type: "string" },
    //                                            Notes: { type: "string" },
    //                                            FileID: { type: "number" },
    //                                            FileName: { type: "string" },
    //                                            Violation: { type: "string" },
    //                                            strViolationDate: { type: "string" },
    //                                            AdminNoticeNumber: { type: "string" },
    //                                            strNoticeIssueDate: { type: "string" },
    //                                        }
    //                                    }
    //                                },
    //                                pageSize: 10
    //                            },
    //                            scrollable: true,
    //                            sortable: true,
    //                            pageable:
    //                            {
    //                                pageSizes: true,
    //                                buttonCount: 3
    //                            },
    //                            filterable: {
    //                                extra: false,
    //                                operators: {
    //                                    string: {
    //                                        startswith: "Starts with",
    //                                        eq: "Is equal to",
    //                                        neq: "Is not equal to"
    //                                    }
    //                                }
    //                            },
    //                            columns: [
    //                                { field: "WarningID", title: "Warning ID", width: 130, template: "<a href='\\#' class='link' onclick='previewWarningDataById(\"#=WarningID#\")'>#=WarningID#</a>" },
    //                                { field: "CreatedBy", title: "Added by", width: 130, hidden: "true" },
    //                                { field: "SubjectId", title: "Subject ID", width: 130 },
    //                                { field: "DateCreated", title: "Date Created", width: 130, hidden: "true", format: "{0:MM/dd/yyyy}" },
    //                                //{ field: "ActivityStartDateTime", title: "Start Date", width: 130, format: "{0:MM/dd/yyyy}" },
    //                                //{ field: "ActivityEndDateTime", title: "End Date", width: 130, format: "{0:MM/dd/yyyy}" },
    //                                //{ field: "ActivityClass", title: "Class", width: 130 },
    //                                //{ field: "Activity", title: "Activity", width: 200 },
    //                                { field: "Violation", title: "Violation", width: 200 },
    //                                { field: "strViolationDate", title: "Violation Date", width: 130, format: "{0:MM/dd/yyyy hh:mm tt}" },
    //                                { field: "strNoticeIssueDate", title: "Notice Issue Date", width: 130, format: "{0:MM/dd/yyyy hh:mm tt}" },
    //                                { field: "Notes", title: "Notes", width: 180, hidden: "true" },
    //                                { field: "FileID", title: "ID", hidden: "true" },
    //                                { field: "FileName", title: "Attachments", width: 100, hidden: "true", template: "<a href='/Enforcement/DownloadFile?FileID=\#=FileID#\' target='_blank' class='link'>#=FileName#</a>" },
    //                                {
    //                                    template: "<a onclick=\"openEditCaseWarning(\'#=WarningID#\')\"><i class='ion-edit'></i></a>&nbsp;&nbsp;<a style='display: " + isClosed() + "' onclick=\"DeleteWarning(\'#=WarningID#\')\"  ><i class='text-danger k-icon k-i-delete'></i></a>",
    //                                    field: "WarningID",
    //                                    filterable: false,
    //                                    sortable: false,
    //                                    width: 100,
    //                                    title: "Actions",
    //                                    hidden: isClosed(),
    //                                    headerAttributes: { style: "color: #333; font-size: 15px; font-weight: 600; text-decoration: none;" }
    //                                }
    //                            ]
    //                        });

    //                        //////====<start> EGIS-170
    //                        //if (($("#PrimaryStatus").val() === "Closed" || $("#PrimaryStatus").val() === "Suspended") && $("#HasExpungementPermission").val() === "false") {
    //                        //    $("#createWarning").hide();
    //                        //} else {
    //                        //    $("#createWarning").show();
    //                        //}
    //                        //////====<end> EGIS-170
    //                    }
    //                    else {
    //                        if ($('#divNoRecordFoundMessage').length) {
    //                            disPlayNotExistMessage('No warnings are found on this record.');                                
    //                        }
    //                    }
    //                },
    //                error: function (xhr) {
    //                    var popupNotification = $("#Notification").data("kendoNotification");
    //                    popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
    //                },
    //            });
    //        }
    //        else {
    //            var popupNotification = $("#Notification").data("kendoNotification");
    //            popupNotification.show({ message: "No record was found." }, "warning");
    //        }
    //    },
    //    error: function (xhr) {
    //        var popupNotification = $("#Notification").data("kendoNotification");
    //        popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
    //    },
    //});
}

function openEditCaseWarning(warningId) {

    selectedWarningId = warningId;
    //EditCaseWarning();
    CreateCaseWarning(1);
}

function EditCaseWarning() {
    $.ajax({
        type: "GET",
        url: "/Enforcement/EditCaseWarning",
        success: function (data) {
            if (data != null) {
                //hideAllDivs('edit-activity');
                hideAllPartialViews('editCaseWarningPartialView');
                $("#editCaseWarningPartialView").html(data);

                //==============

                //getActivityAssociationListsEdit();

                //if (data.ActivityDivisionId > 0) {
                //    activityDivisionId = data.ActivityDivisionId;
                //    getActivityClasses(activityDivisionId);

                //}

                //if (data.ActivityClassId > 0) {
                //    activityClassId = data.ActivityClassId;
                //    getActivityLists(activityClassId);
                //}

                //hideMobileSidebar();

                //getInvestigatorsByInvIdEdit();

                //loadWarningForEdit(selectedWarningId);

                //hideMobileSidebar();
            }
            else {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "No record was found." }, "warning");
            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        },
    });
}

function previewCaseWarningData() {
    if (selectedWarningId == 0) return;
    //hideInvestigationDivs('viewCaseWarningData');
    document.getElementById('viewCaseWarningResults').classList.add('hidden');
    document.getElementById('viewCaseWarningData').classList.remove('hidden');
    //hideAllPartialViews('searchCaseWarningPartialView');
    hideMobileSidebar();

    $.ajax({
        type: "GET",
        url: "/Enforcement/GetWarningMasterById?warningID=" + selectedWarningId,
        dataType: "json",
        success: function (data) {
            if (data != null) {
                document.getElementById('viewCaseWarningData').classList.remove('hidden');
                var elements = document.getElementsByName("viewWarningID");
                for (i = 0; i < elements.length; i++) {
                    elements[i].innerHTML = data.WarningId;
                }
                document.getElementById('viewCaseWarningAdminNoticeNumber').innerHTML = data.AdminNoticeNumber;
                document.getElementById('viewCaseWarningViolation').innerHTML = data.Violation;
                document.getElementById('viewCaseWarningDivision').innerHTML = data.ActivityDivision;

                //document.getElementById('viewViolationDate').innerHTML = data.strViolationDate != null && data.strViolationDateTime != null ? (data.strViolationDate + ' ' + data.strViolationDateTime) : 'None';
                //document.getElementById('viewNoticeIssueDate').innerHTML = data.strNoticeIssueDate != null && data.strNoticeIssueDateTime != null ? (data.strNoticeIssueDate + ' ' + data.strNoticeIssueDateTime) : 'None';
                document.getElementById('viewCaseWarningViolationDate').innerHTML = data.strViolationDateTime != null ? data.strViolationDateTime : 'None';
                document.getElementById('viewCaseWarningNoticeIssueDate').innerHTML = data.strNoticeIssueDateTime != null ? data.strNoticeIssueDateTime : 'None';


                document.getElementById('viewActivityStartDate').innerHTML = data.strStartDate != null && data.strStartTime != null ? (data.strStartDate + ' ' + data.strStartTime) : 'None';
                document.getElementById('viewActivityEndDate').innerHTML = data.strEndDate != null && data.strEndTime != null ? (data.strEndDate + ' ' + data.strEndTime) : 'None';
                document.getElementById('viewActivityClass').innerHTML = data.ActivityClass;
                document.getElementById('viewActivityType').innerHTML = data.ActivityType;
                document.getElementById('viewActivityGrantCode').innerHTML = data.GrantCode != "" ? data.GrantCode : 'None';
                document.getElementById('viewActivityOperationName').innerHTML = data.OperationName != "" ? data.OperationName : 'None';
                document.getElementById('viewCaseWarningSubjectId').innerHTML = data.SubjectId != "" ? data.SubjectId : 'None';

                //if (data.ActivityDivision == "AUD") {
                //    document.getElementById('ActivityRequestedAgeID').classList.add('hidden');
                //    document.getElementById('ActivityRequestedMinorID').classList.add('hidden');

                //    //$("#ActivityRequestedAgeID").hide();
                //    //$("#ActivityRequestedMinorID").hide();
                //    if (1 == data.HasRequestedMinorId) {
                //        document.getElementById('viewActivityRequestedMinorID').innerHTML = "Yes";
                //    } else if (2 == data.HasRequestedMinorId) {
                //        document.getElementById('viewActivityRequestedMinorID').innerHTML = "No";
                //    } else {
                //        document.getElementById('viewActivityRequestedMinorID').innerHTML = "Not Applicable";
                //    }
                //    if (1 == data.HasRequestedAge) {
                //        document.getElementById('viewActivityRequestedAge').innerHTML = "Yes";
                //    } else if (2 == data.HasRequestedAge) {
                //        document.getElementById('viewActivityRequestedAge').innerHTML = "No";
                //    } else {
                //        document.getElementById('viewActivityRequestedAge').innerHTML = "Not Applicable";
                //    }
                //}
                //else {
                //    document.getElementById('ActivityRequestedAgeID').classList.remove('hidden');
                //    document.getElementById('ActivityRequestedMinorID').classList.remove('hidden');
                //}
                //
                document.getElementById('viewCaseWarningNotes').innerHTML = data.Notes != "" ? stripHtmlTags(data.Notes) : 'None';
                document.getElementById('viewCaseWarningReportType').innerHTML = data.ReportType;
                document.getElementById('viewCaseWarningInvestigator').innerHTML = data.InvestigatorName;
                document.getElementById('viewCaseWarningFile').innerHTML = generateFilesTemplate(data.Files);
                //AssignInvestigationDataById();

                //if (($("#PrimaryStatus").val() === "Closed" || $("#PrimaryStatus").val() === "Suspended") && $("#HasExpungementPermission").val() === "false") {
                //    $("#btnWarningEdit").hide();
                //} else {
                //    $("#btnWarningEdit").show();
                //} //Discussion pending with Chandra on this

            }
            else {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "No record was found." }, "warning");
            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        },
    });
}

function backToCaseWarningResults() {
    //document.getElementById('viewCaseWarningResults').classList.remove('hidden');
    document.getElementById('viewCaseWarningData').classList.add('hidden');
    previewCaseWarnings();
}

function loadWarningDetails(warnId) {
    //Make sure dependancies loaded
    //if (!actCriminalViolations || (Array.isArray(actCriminalViolations) && actCriminalViolations.length == 0)) {
    //    setTimeout(function () {
    //        loadWarningDetails(warnId);
    //    }, 300);
    //    return;
    //}
    // loadActViolationDropdowns();
    loadWarningForNew(warnId);
}

function DeleteWarning(WarningID) {

    if (confirm("Are you sure to delete this Warning?")) {
        const urlParams = new URLSearchParams(window.location.search.toLowerCase());
        const WorkitemID = urlParams.get('workitemid');
        const AppID = urlParams.get('applicationid');

        $.ajax({
            type: "POST",
            data: { "WarningID": WarningID, "InvestigationID": selectedInvestigationID, "WorkitemType": workItemType, "WorkitemID": WorkitemID, "AppID": AppID },
            url: "/Enforcement/DeleteWarning",

            success: function (results) {

                if (results.length != 0) {

                    var popupNotification = $("#Notification").data("kendoNotification");
                    popupNotification.show({ message: "Warning has been deleted." }, "success");
                    //return;
                    setTimeout(() => {
                        CaseSearchWarningResult();
                    }, 1000);
                    //previewCaseSearchWarning();
                }
            },
            error: function (objError) {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
            }
        });
    }
}


function loadReferralCaseDetails(caseId) {
    var _url = "/Enforcement/GetReferringCaseDetails?dispositionRecommendationId=" + caseId;

    $.ajax({
        type: "GET",
        url: _url,
        dataType: "json",
        success: function (results) {
            $("#refCaseDetailsResult").empty();

            if (results.length > 0) {
               sourceRecordType = results[0].Source;

                $("#refCaseDetailsResult").kendoGrid({
                    toolbar: ["excel"],
                    excel: {
                        fileName: "RefCaseDetails.xlsx",
                        allPages: true,
                    },
                    dataSource: {
                        data: results,
                        schema: {
                            model: {
                                fields: {
                                    DispositionRecommendationId: { type: "number" },
                                    CaseType: { type: "string" },
                                    AdminNoticeNumber: { type: "number" },

                                    IsClassified: { type: "string" },
                                    Subject: { type: "string" },
                                    Source: { type: "string" },
                                    WorkitemID: { type: "number" },
                                    WorkitemTypeID: { type: "number" },
                                    SourceWorkitemType: { type: "string" },
                                    SourceWorkItemID: { type: "number" },
                                    SourceID: { type: "number" },
                                }
                            }
                        },
                        pageSize: 10
                    },
                    scrollable: true,
                    sortable: true,
                    pageable:
                    {
                        pageSizes: true,
                        buttonCount: 3
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
                        {
                            field: "DispositionRecommendationId", title: "Case Id", width: 130,
                            template: function (dataItem) {
                                // Your condition here
                                if (dataItem.Source == "License") {
                                    // If the condition is false, display a label
                                    return '<span>' + dataItem.DispositionRecommendationId + '</span>';

                                } else {// If the condition is true, display a link
                                    //return "'<a href='\\#' class='link' onclick='previewCase(\'" + dataItem.DispositionRecommendationId + "," + dataItem.WorkitemID + "," +dataItem.WorkitemTypeID+")'>"+dataItem.DispositionRecommendationId+"</a>";
                                    return '<a href=#  onclick="previewCase(\'' + dataItem.DispositionRecommendationId + '\', \'' + dataItem.WorkitemID + '\', \'' + dataItem.WorkitemTypeID + '\');">' + dataItem.DispositionRecommendationId + '</a>';
                                }
                            }
                        },

                        //{ field: "DispositionRecommendationId", title: "Case Id", width: 130, template: "<a href='\\#' class='link' onclick='previewCase(\"#=DispositionRecommendationId#\",\"#=WorkitemID#\",\"#=WorkitemTypeID#\")'>#=DispositionRecommendationId#</a>" },
                        { field: "CaseType", title: "Case Type", width: 130, template: "#= CaseType != null && CaseType !== undefined ? CaseType : 'N/A' #" },
                        { field: "AdminNoticeNumber", title: "Admin Notice Number", width: 200, template: "#= AdminNoticeNumber != null && AdminNoticeNumber !== undefined ? AdminNoticeNumber : 'N/A' #" },
                        { field: "Subject", title: "Case Clearence", width: 130, template: "#= Subject != null && Subject !== undefined ? Subject : 'N/A' #" },

                        { field: "Status", title: "Status", width: 150, template: "#= Status != null && Status !== undefined ? Status : 'N/A' #" },
                        //{ field: "Source", title: "Source", width: 200, template: "<a href='\\#' class='link' onclick='previewInvestigation(\"#=InvestigationId#\")'>#=Source# - #=CustomInvNumber#</a>" }
                        { field: "Source", title: "Source", width: 150, template: "<a href='\\#' class='link' onclick='previewSourceItem(\"#=InvestigationId#\",\"#=SourceWorkItemID#\",\"#=SourceWorkitemType#\")'>#=Source# - #=SourceID#</a>" }

                        , { field: "WorkitemID", title: "Workitem ID", width: 200, hidden: "true" }
                        , { field: "WorkitemTypeID", title: "WorkitemType ID", width: 200, hidden: "true" }

                    ]
                });


            }
            else {
                if ($('#divNoRecordFoundMessage').length) {
                    disPlayNotExistMessage('No Ref cases are found on this record.');
                }
            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        },
    });


}
function previewCase(ItemID, WorkItemID, WorkitemTypeID) {
    
    window.open("/process/InvCaseworkflow?WorkitemID=" + WorkItemID + "&WorkitemTypeID=" + WorkitemTypeID + "&WorkitemType=" + 'CAS' + "&ApplicationID=" + ItemID, target = "_blank");

}

function previewSourceItem(investigationID, WorkItemID, WorkitemTypeID) {
    
    if (WorkitemTypeID == 'LIC') {
        /* https://aims-eros.gov2biz.com/process/workflow?WorkitemID=10557&WorkitemTypeID=1&WorkitemType=LIC#*/
        window.open("/process/workflow?WorkitemID=" + WorkItemID + "&WorkitemTypeID=1" + "&WorkitemType=" + 'LIC' + "&ApplicationID=" + investigationID, target = "_blank");
    }
    else if (WorkitemTypeID == 'INV') {

        /*  https://aims-eros.gov2biz.com/Enforcement/Dashboard?appId=2557&workitemId=10240&workitemTypeId=INV#*/
        window.open("/Enforcement/Dashboard?workitemId=" + WorkItemID + "&workitemTypeId=INV" + "&appId=" + investigationID, target = "_blank");
    }
    else {

        /*https://aims-eros.gov2biz.com/Enforcement/Dashboard?appId=849&workitemId=10556&workitemTypeId=INS#*/
        window.open("/Enforcement/Dashboard?workitemId=" + WorkItemID + "&workitemTypeId=INS" + "&appId=" + investigationID, target = "_blank");
    }
}

function previewInvestigation(investigationID) {
    
    window.open("/Enforcement/Dashboard?workitemTypeId=INV&workitemId=" + investigationID, target = "_blank");
}

function hideLegalCaseActions() {
    $("#selectLegalCaseActions1").hide();
    $("#addViolation").hide();
    $("#btnDismissViolation").hide();
    $("#btnAddNewCorrespondence").hide();
    $("#addNotes").hide();
    $("#dvBtnDissmiss").hide();
    //alert($("#hdnLegalCaseStatus").val());
    if ($("#hdnLegalCaseStatus").val() == 'Case Closed' || $("#hdnLegalCaseStatus").val() == 'Case Dismissed' || $("#hdnLegalCaseStatus").val() == 'Case Combined') {
        loadMasterData1('LegalCaseStatus', 'dis_ddlLegalCaseStatus', '');
        //location.reload(true);
    }

    // alert(2);
}

function loadMasterData1(type, controlId, selectedValue) {

    //$("#dis_ddlLegalCaseStatus").val($("#dis_ddlLegalCaseStatus option[selected]").val());
    $('#dis_ddlLegalCaseStatus').empty();
    $.ajax({
        url: '/process/GetMasterData',
        type: 'GET',
        data: { type: type },
        success: function (data) {
            loadDropdown1(data, controlId, selectedValue);
        },
        error: function (error) {
            console.log(error);
        }
    });
}

function loadDropdown1(data, controlId, selectedValue) {

    var container = $('#' + controlId);

    if ($("#hdnLegalCaseStatus").val() == 'Case Closed' || $("#hdnLegalCaseStatus").val() == 'Case Dismissed' || $("#hdnLegalCaseStatus").val() == 'Case Combined') {
        $.each(data, function (index, item) {
            if (item.Value == 'Select' || item.Value == 'Reopen Case') {
                container.append('<option value="' + item.Id + '">' + item.Value + '</option>');
            }
        });
    }
    else {
        $.each(data, function (index, item) {
            if (item.Value != 'Reopen Case') {
                container.append('<option value="' + item.Id + '">' + item.Value + '</option>');
            }
        });
    }
    //if (selectedValue) {
    //    container.val(selectedValue);
    //}
}

function getCaseAppointmentList() {
    if (document.getElementById('divAddNewAppointment')) {
        document.getElementById('divAddNewAppointment').classList.add('hidden');
    }
    if (document.getElementById('divListAppointment')) {
        document.getElementById('divListAppointment').classList.remove('hidden');
    }

    $.ajax({
        type: "GET",
        url: "/Enforcement/GetAppointmentsByCaseId?caseId=" + $('#hdnApplicationId').val(),
        dataType: "json",
        success: function (results) {
            $("#appointmentResult").empty();
            caseAppointmentList = results;
            if (results.length > 0) {
                $("#appointmentResult").kendoGrid({
                    toolbar: ["excel"],
                    excel: {
                        fileName: "caseAppointment.xlsx",
                        allPages: true,
                    },
                    dataSource: {
                        data: results,
                        schema: {
                            model: {
                                fields: {
                                    AppointmentId: { type: "number" },
                                    AppointmentTypeId: { type: "number" },
                                    AppointmentType: { type: "string" },
                                    Comment: { type: "string" },
                                    AppointmentDate: { type: "date" },
                                    strAppointmentDate: { type: "string" },
                                    strModifiedDate: { type: "string" },
                                    ModifiedDate: { type: "date" }

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
                        { field: "AppointmentType", title: "Milestone Type", width: 180 },
                        /* { field: "Comment", title: "Comment", width: 180 },*/
                        {
                            field: "Comment", title: "Comment", width: 180, template: "<div style='white-space:normal;word-break: break-all;'>#= stripHtmlTags(Comment) #</div>"
                        },
                        //{ field: "AppointmentDate", title: "Appointment Date", width: 180, format: "{0:MM/dd/yyyy}" },
                        //{ field: "ModifiedDate", title: "Modified Date", width: 160, format: "{0:MM/dd/yyyy}" },
                        { field: "strAppointmentDate", title: "Milestone Date", width: 160 },
                        { field: "strModifiedDate", title: "Modified Date", width: 160 },

                        {
                            width: 100, title: "Actions",
                            template: function (dataItem) {
                                let actionTemplate = '';
                                actionTemplate += '<a type="button" onclick="editCaseAppointment(' + dataItem.AppointmentId + ',' + dataItem.AppointmentTypeId + ')"><i class="ion-edit"></i></a>';
                                actionTemplate += '&nbsp;&nbsp;&nbsp;';
                                actionTemplate += '<a type="button" onclick="deleteCaseAppointment(' + dataItem.AppointmentId + ')"><i class="text-danger k-icon k-i-delete"></i></i></a>';
                                return actionTemplate;
                            }

                        },
                    ]
                });
                document.getElementById('appointmentResultTitle').innerHTML = 'Below is the list of milestone added to this Legal.';
            }
            else {
                if ($('#divNoRecordFoundMessage').length) {
                    const workItemTypeName = getWorkItemTypeNameForWarningMessage();
                    disPlayNotExistMessage(`No milestones are found on this ${workItemTypeName}.`);
                }

            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        },
    });
}
function add_NewAppointment() {
    var appointmentComment = $("#Appointment_Comment").data("kendoEditor");
    $("#dis_selectCaseAppointmentType").val('-1');
    $("#txtAppointmentDate").val('');
    appointmentComment.value('');
    if (document.getElementById('divListAppointment')) {
        document.getElementById('divListAppointment').classList.add('hidden');
    }
    if (document.getElementById('divAddNewAppointment')) {
        document.getElementById('divAddNewAppointment').classList.remove('hidden');
    }
    document.getElementById('btnUpdateAppointment').classList.add('hidden');
    document.getElementById('btnSubmitAppointment').classList.remove('hidden');
}
function editCaseAppointment(appointmentId, appointmentTypeId) {
    var comment = caseAppointmentList.find(x => x.AppointmentId == appointmentId).Comment;
    var appointmentDate = caseAppointmentList.find(x => x.AppointmentId == appointmentId).strAppointmentDate;

    $("#hdnAppointmentId").val(appointmentId);
    $("#dis_selectCaseAppointmentType").val(appointmentTypeId);
    $("#txtAppointmentDate").val(formatCaseDate(appointmentDate));
    $('#Appointment_Comment').data('kendoEditor').value(stringDataToHTML(comment));

    if (document.getElementById('divListAppointment')) {
        document.getElementById('divListAppointment').classList.add('hidden');
    }
    if (document.getElementById('divAddNewAppointment')) {
        document.getElementById('divAddNewAppointment').classList.remove('hidden');
    }
    document.getElementById('btnUpdateAppointment').classList.remove('hidden');
    document.getElementById('btnSubmitAppointment').classList.add('hidden');
}
function updateCaseAppointment() {
    submitCaseAppointment(1);
}
function deleteCaseAppointment(appointmentId) {
    if (!confirm('Are you sure to delete this record?')) {
        return;
    }
    var removeRequest = new Object();
    removeRequest.Id = appointmentId;

    $.ajax({
        type: "POST",
        url: "/Enforcement/DeleteAppointmentById",
        contentType: "application/json",
        data: JSON.stringify(removeRequest),
        success: function (result) {
            var popupNotification = $("#Notification").data("kendoNotification");
            if (result == "True") {
                popupNotification.show({ message: "Removed Milestone from this record." }, "success");
                getCaseAppointmentList();
            }
            else {
                popupNotification.show({ message: "Error removing Milestone from this record." }, "error");
            }

        },
        error: function (objError) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        }
    });
}
function backToAppointment() {
    if (document.getElementById('divListAppointment')) {
        document.getElementById('divListAppointment').classList.remove('hidden');
    }
    if (document.getElementById('divAddNewAppointment')) {
        document.getElementById('divAddNewAppointment').classList.add('hidden');
    }
}
function formatCaseDate(date) {
    // Ensure date is a Date object
    if (!(date instanceof Date)) {
        date = new Date(date);
    }

    // Extract date components
    var month = date.getMonth() + 1; // Months are zero-based
    var day = date.getDate();
    var year = date.getFullYear();

    // Add leading zeros if needed
    month = (month < 10) ? '0' + month : month;
    day = (day < 10) ? '0' + day : day;

    // Format as MM/dd/yyyy
    var formattedDate = month + '/' + day + '/' + year;

    return formattedDate;
}
function stringDataToHTML(str) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(str, 'text/html');
    return doc.body.innerText;
}
function isValidDateFormat(event) {
    var key = String.fromCharCode(event.keyCode || event.which);
    // Check if the pressed key is a digit or a slash
    if (!/[\d\/]/.test(key)) {
        event.preventDefault();
        return false;
    }
    // Get the current input value
    // var inputValue = event.target.value + key;

    return true;

}

function stripHtmlTags(input) {
    var stripped = $("<div/>").html(input).text();
    return stripped;
}

function GenerateLicenseReport(LicenseID, WorkitemID = 0, InvestigationID = 0, hdnWorkItemTypeIDs = 0, WorkItemType = 0, hdnLegalcaseId = 0) {
    if (LicenseID == '' || LicenseID == 0) {
        var popupNotification = $("#Notification").data("kendoNotification");
        popupNotification.show({ message: "License Number not available" }, "error");
        return;
    }
    $.ajax({
        type: "GET",
        url: "/Process/GetPermitteeResearchReportData?LicenseID=" + LicenseID + "&WorkItemID=" + WorkitemID + "&WorkitemTypeID=" + hdnWorkItemTypeIDs + "&WorkItemType=" + WorkItemType + "&CaseID=" + hdnLegalcaseId + "&InvestigationID=" + InvestigationID,
        // dataType: "json",
        success: function (results) {
            
            ShowLoader();
            // alert('success');
            //LoadBasicInformation(subjectId);
            // LoadPrincipalPersonalInfo(results.PersonOrBusinessID);
            hideAllPartialViews('permitteeResearchReportPartialView');
            $("#permitteeResearchReportPartialView").html(results);
            if ((WorkItemType === "LEG") && $('#hdnSubjectType').val() === "License") {
                if (IsNotNullOrEmptyById("rptLegalCaseType") && IsNotNullOrEmptyById("hdnLegalCaseType")) {
                    document.getElementById("rptLegalCaseType").innerHTML = $('#hdnLegalCaseType').val();
                }
                if (IsNotNullOrEmptyById("rptLegalAdminNoticeNumber") && IsNotNullOrEmptyById("hdnLegalAdminNoticeNumber")) {
                    document.getElementById("rptLegalAdminNoticeNumber").innerHTML = $('#hdnLegalAdminNoticeNumber').val();
                }
                if (IsNotNullOrEmptyById("rptLegalCaseId") && IsNotNullOrEmptyById("hdnLegalcaseId")) {
                    document.getElementById("rptLegalCaseId").innerHTML = $('#hdnLegalcaseId').val();
                }
                if (IsNotNullOrEmptyById("rptLegalJuvenileJustice") && IsNotNullOrEmptyById("hdnLegalJuvenileJustice")) {
                    document.getElementById("rptLegalJuvenileJustice").innerHTML = $('#hdnLegalJuvenileJustice').val();
                }
                if (IsNotNullOrEmptyById("rptLegalClassified") && IsNotNullOrEmptyById("hdnLegalClassified")) {
                    document.getElementById("rptLegalClassified").innerHTML = $('#hdnLegalClassified').val();
                }
                if (IsNotNullOrEmptyById("rptLegalCaseAdopted") && IsNotNullOrEmptyById("hdnLegalCaseAdopted")) {
                    document.getElementById("rptLegalCaseAdopted").innerHTML = $('#hdnLegalCaseAdopted').val();
                }
            }

            HideLoader();
        },
        error: function (xhr) {
            // alert('error');
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        },
    });
}

function IsNotNullOrEmptyById(id) {
    if (document.getElementById(id) != undefined && document.getElementById(id) != null) {
        return true;
    } else {
        return false;
    }
}

function completeSettlement() {
    
    var isEducationSelectedbyUser = $('#IsEducationSelectedbyUser').val();

    if ($("#SettlementType").val() == 'Suspension or Civil Penalty With Education' || $("#SettlementType").val() == 'Suspension or Civil Penalty with Education and Bond') {
        if (isEducationSelectedbyUser == '-1') {
            document.getElementById('err_isEducationSelectedbyUser').classList.remove('hidden');
            return;
        } else {
            document.getElementById('err_isEducationSelectedbyUser').classList.add('hidden');
        }
    }
    var filesInput = $("#settlement_SignedAgreementFile").data("kendoUpload").getFiles();
    var actionType = "Complete Settlement Agreement";

    if (filesInput.length > 0) {
        var fileRequest = new FormData();
        for (var i = 0; i < filesInput.length; i++) {
            fileRequest.append('requestFiles', filesInput[i].rawFile)
        }

        $.ajax({
            type: "POST",
            enctype: 'multipart/form-data',
            url: "/Enforcement/UploadEnforcementFiles?uploadReason=AllPartiesSignedAgreement",
            data: fileRequest,
            processData: false,
            contentType: false,
            cache: false,
            timeout: 600000,
            success: function (result) {
                //request.IsFileUploaded = true;
                /*request.Files = result;*/
                var request = new Object();
                request.FileID = result[0].FileId;
                request.FileName = result[0].FileName;
                request.DocumentType = "Settlement Agreement";
                request.IsEducationSelectedbyUser = isEducationSelectedbyUser;
                var settlementAction = $('#selectSettlementActions').find(":selected").text();
                var settlementActionId = $('#selectSettlementActions').find(":selected").val();
                var settlementId = $("#SettlementId").val();
                var caseTypeId = $("#hdnCaseTypeId").val();

                PerformSettlementAction(caseId, settlementActionId, settlementId, caseTypeId, request);

            },
            error: function (objError) {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "Error uploading file on plat." }, "error");
            }
        });
    }
}




function fnSendDocToLicensee() {
    hideAllPartialViews('divSendDocToLicensee');
    fnResetSendDocToLicenseeValues();
    if (legalCaseId > 0) {
        GetLegLicenseeDocumentsList(legalCaseId);
    }
    fnsetSendDocToLicenseeValues();

}
function fnResetSendDocToLicenseeValues() {
    document.getElementById('sendDocLicenseId').innerHTML = '';
    document.getElementById('sendDocLicenseType').innerHTML = '';
    document.getElementById('sendDocLicenseStatus').innerHTML = '';
    document.getElementById('sendDocLicenseAddress').innerHTML = '';
    if (document.getElementById('divSendDocToLicensee')) {
        document.getElementById('divSendDocToLicensee').classList.add('hidden');
    }
    if (document.getElementById('errorSendDocLicenseFile')) {
        document.getElementById('errorSendDocLicenseFile').classList.add('hidden');
    }
    if (document.getElementById('errorSendDocLicenseFileSize')) {
        document.getElementById('errorSendDocLicenseFileSize').classList.add('hidden');
    }
    //document.getElementById('errorSendDocLicenseFile').classList.add('hidden');
    //document.getElementById('errorSendDocLicenseFileSize').classList.add('hidden');
    $("#sendDocLicenseSignedFile").data("kendoUpload").clearAllFiles();
    $("#sendDocToLicenseeResultTitle").empty();
    $("#sendDocToLicenseeResult").empty();
}
function fnsetSendDocToLicenseeValues() {
    if (sendDocToLicenseeData.length > 0) {
        document.getElementById('sendDocLicenseId').innerHTML = (sendDocToLicenseeData[0].LicenseId != null && sendDocToLicenseeData[0].LicenseId !== '') ? sendDocToLicenseeData[0].LicenseId : 'N/A';
        document.getElementById('sendDocLicenseType').innerHTML = (sendDocToLicenseeData[0].LicenseType != null && sendDocToLicenseeData[0].LicenseType !== '') ? sendDocToLicenseeData[0].LicenseType : 'N/A';
        document.getElementById('sendDocLicenseStatus').innerHTML = (sendDocToLicenseeData[0].LicenseStatus != null && sendDocToLicenseeData[0].LicenseStatus !== '') ? sendDocToLicenseeData[0].LicenseStatus : 'N/A';
        document.getElementById('sendDocLicenseAddress').innerHTML = (sendDocToLicenseeData[0].LocationAddress != null && sendDocToLicenseeData[0].LocationAddress !== '') ? sendDocToLicenseeData[0].LocationAddress : 'N/A';
        document.getElementById('sendDocLicenseTradeName').innerHTML = (sendDocToLicenseeData[0].TradeName != null && sendDocToLicenseeData[0].TradeName !== '') ? sendDocToLicenseeData[0].TradeName : 'N/A';

        if (document.getElementById('divSendDocToLicensee')) {
            document.getElementById('divSendDocToLicensee').classList.remove('hidden');
        }
    }
}
function fnCancelSendDocToLicensee() {
    fnResetSendDocToLicenseeValues();
    previewLegalInvCaseOverviewInformation_ReadOnly();
}
function sendDocToLicensee() {
    var filesInput = $("#sendDocLicenseSignedFile").data("kendoUpload").getFiles();
    if (filesInput.length > 0) {
        if (filesInput[0].size > 5242880) {
            document.getElementById('errorSendDocLicenseFileSize').classList.remove('hidden');
            document.getElementById('errorSendDocLicenseFile').classList.add('hidden');
        }
        else {
            var fileRequest = new FormData();
            for (var i = 0; i < filesInput.length; i++) {
                fileRequest.append('requestFiles', filesInput[i].rawFile)
            }

            $.ajax({
                type: "POST",
                enctype: 'multipart/form-data',
                url: "/Enforcement/UploadEnforcementFiles?uploadReason=sendSignedDocToLicensee",
                data: fileRequest,
                processData: false,
                contentType: false,
                cache: false,
                timeout: 600000,
                success: function (result) {
                    
                    if (result != null && result.length > 0) {
                        var request = new Object();
                        request.FileID = result[0].FileId;
                        request.FileName = result[0].FileName;
                        request.workItemId = $("#hdnWorkItemID").val();;
                        request.LegalCaseID = caseId;
                        request.LicenseID = sendDocToLicenseeData[0].LicenseId;
                        legLicenseeDocumentsAction(request);
                    }


                },
                error: function (objError) {
                    var popupNotification = $("#Notification").data("kendoNotification");
                    popupNotification.show({ message: "Error uploading file." }, "error");
                }
            });
        }
    }
    else {
        document.getElementById('errorSendDocLicenseFile').classList.remove('hidden');
        document.getElementById('errorSendDocLicenseFileSize').classList.add('hidden');
    }
}

function legLicenseeDocumentsAction(model) {
    if (model != null) {
        $.ajax({
            type: "POST",
            url: "/Enforcement/LegLicenseeDocumentsAction",
            contentType: "application/json",
            data: JSON.stringify(model),
            success: function (data) {
                
                var popupNotification = $("#Notification").data("kendoNotification");
                if (data == "True") {
                    document.getElementById('errorSendDocLicenseFile').classList.add('hidden');
                    document.getElementById('errorSendDocLicenseFileSize').classList.add('hidden');
                    $("#sendDocLicenseSignedFile").data("kendoUpload").clearAllFiles();
                    popupNotification.show({ message: "Request processed successfully." }, "success");
                    GetLegLicenseeDocumentsList(legalCaseId);
                }
                else
                    popupNotification.show({ message: "Error while processing request" }, "error");
            },
            error: function (objError) {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "Error while processing request" }, "error");
            }
        });
    }
}

function GetLegLicenseeDocumentsList(legalCaseId) {
    $.ajax({
        type: "GET",
        url: "/Enforcement/GetLegLicenseeDocumentsByLegalCaseId?legalCaseId=" + legalCaseId,
        dataType: "json",
        success: function (results) {
            
            $("#sendDocToLicenseeResult").empty();
            if (results.length > 0) {
                $("#sendDocToLicenseeResult").kendoGrid({
                    toolbar: ["excel"],
                    excel: {
                        fileName: "sendDocToLicensee.xlsx",
                        allPages: true,
                    },
                    dataSource: {
                        data: results,
                        schema: {
                            model: {
                                fields: {
                                    FileID: { type: "number" },
                                    CreatedBy: { type: "string" },
                                    strCreatedDate: { type: "string" },
                                    FileName: { type: "string" },
                                    EncriptedFileId: { type: "string" },
                                    strLicenseeActionDate: { type: "string" },
                                    Status: { type: "string" }

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
                        { field: "CreatedBy", title: "Created By", width: 180 },
                        { field: "strCreatedDate", title: "Created Date", width: 160 },
                        { field: "FileName", title: "File Name", width: 180, template: "<a href='/Enforcement/DownloadFile?FileID=\#=EncriptedFileId#\' target='_blank' class='link'>#=FileName#</a>" },

                        { field: "strLicenseeActionDate", title: "Licensee Action Date", width: 180 },
                        { field: "Status", title: "Status", width: 160 },
                    ]
                });
                document.getElementById('sendDocToLicenseeResultTitle').innerHTML = 'Below is the list of Documents sent to Licensee.';
            }
            else {
                $("#sendDocToLicenseeResultTitle").empty();
                $("#sendDocToLicenseeResult").empty();
                //if ($('#divNoRecordFoundMessage').length) {
                //    const workItemTypeName = getWorkItemTypeNameForWarningMessage();
                //    disPlayNotExistMessage(`No Documents are found on this ${workItemTypeName}.`);
                //}

            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        },
    });
}

