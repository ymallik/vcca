var selectedView = '';
var oneEventRunning = false;
var PrincipalPartyID = 0;
var AllTypesAfterTax = []; //LEVY-188
var DFAmountAfterTax = []; //LEVY-188

var taxedTotalAmount = 0;
var SpiritsCreditAmount = 0;
var MaltCreditAmount = 0;
var WineCreditAmount = 0;
var CreditAmount = 0;
var MaltAmountAfterTax = 0;
var WineAmountAfterTax = 0;
var SpiritsAmountAfterTax = 0;
var DFAmountFinalDue = [];
var amountDifference = 0;

const PLAT_ASSIGNED_TO_ID = 2;

var leftMenuPresentSelectedId = "";
var leftMenuPreviousSelectedId = "";


var isFromProtest = false;
var paymentWriteoffThreshold = 0;

const PlatHistoryTypes = Object.freeze({
    Person: 'Person History',
    License: 'License History',
    Location: 'Location History',
})
var DFDeductCredit = [];

$(document).ready(function () {
    previewCaseInformation(false);
});

const customFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    currencySign: "accounting",
});

function previewCaseInformation(isAudit) {
    var workItemType = $("#hdnWorkItemTypeID").val();
    var workItemID = $("#hdnWorkItemID").val();
    var workItemTypeID = $("#hdnWorkItemTypeIDs").val();
    if (workItemType == null || workItemID == null) return;
    let overviewMenus = document.getElementsByName('Menu_Overview');
    if (overviewMenus.length == 1)
        overviewMenus[0].classList.add('menu-item-active');

    $.ajax({
        type: "GET",
        url: "/Process/CaseInformation",
        data: { "WorkitemTypeID": workItemTypeID, "WorkitemID": workItemID, "IsAudit": isAudit },
        success: function (data) {
            HideLoader();
            applicationId = data.ApplicationId;
            hideAllPartialViews('caseInformationPartialView');
            $("#caseInformationPartialView").html(data);
            if (workItemType == "LIC") {
                document.getElementById('MostRecentAction').classList.remove('hidden');
                $.ajax({
                    type: "GET",
                    url: "/Process/GetWorkflowHistory?WorkItemID=" + workItemID + "&WorkItemTypeID=" + workItemTypeID,
                    dataType: "json",
                    success: function (results) {
                        // alert(results[0].WorkflowActionNotes);
                        document.getElementById('viewMostRecentAction').innerHTML = results[0].WorkflowActionNotes.replace("workitem", "work item");
                    },
                    error: function (xhr) {
                    },
                });
            }
            if (workItemType == "DSR") document.getElementById('RequestedByView').classList.add('hidden');
            else document.getElementById('RequestedByView').classList.remove('hidden');

            var isExpUser = false;
            if (isExpungementMode()) {
                $("#ddlComplaintActions").show();
                //fn_get_Com_NonDisclosureOrder();
                isExpUser = true;
            }
            fn_get_Com_NonDisclosureOrder(isExpUser);
        },
    });

    if (workItemType == 'PLT')
        checkPlatEditEligibility();
}

function previewDeficiencyHistory() {
    hideAllPartialViews('deficiencyHistoryPartialView');
}

function previewAssociatedWorkitems() {
    hideAllPartialViews('associatedWorkItemsPartialView');
}

function previewdeficiancyTrail() {
    hideAllPartialViews('deficiancyTrailPartialView');
}

function previewNotes() {
    hideAllPartialViews('notesPartialView');
}

function previewLegalDepartmentInformation() {
    hideAllPartialViews('LegalDepartmentInformationPartialView');
}

function previewLegalCaseInformation() {
    hideAllPartialViews('LegalCaseDetails');
}

function previewApplicationSummary() {
    hideAllPartialViews('licApplicationSummaryPartialView');
}

function previewLicenseDetails() {
    hideAllPartialViews('licenseDetailsPartialView');
}

function previewFinalize() {
    hideAllPartialViews('finalizePartialView');
}

function previewWorkflowDocument() {
    hideAllPartialViews('workflowDocumentPartialView');
}

function previewHistory() {
    hideAllPartialViews('historyPartialView');
}

function previewRequestReleaseBond() {
    hideAllPartialViews('requestReleaseBondPartialView');
}

function previewDPS() {
    hideAllPartialViews('dpsResultsPartialView');

}

function previewRFI() {
    hideAllPartialViews('rfiPartialView');
}

function previewAssociated() {
    hideAllPartialViews('associatedPartialView');
}

function previewEntity() {
    hideAllPartialViews('entityPartialView');
}

function previewLicense() {
    hideAllPartialViews('licensePartialView');
}
function previewAssociatedLicenses() {
    hideAllPartialViews('associatedLicensesPartialView');
}

function previewtakeOverContractingLocation() {
    hideAllPartialViews('takeOverContractingLocationPartialView');
}

function previewMergerDetails() {
    hideAllPartialViews('mergerDetailsPartialView');
}

function previewTENDetails() {
    hideAllPartialViews('temporaryEventNotificationPartialView');
}

function previewChangeOfPrincipalParties() {
    hideAllPartialViews('changeOfPrincipalPartiesPartialView');
}

function hideAllPartialViews(view) {
    if (view == selectedView) return; // to avoid rendering again
    selectedView = view;
    if (document.getElementById('caseInformationPartialView'))
        document.getElementById('caseInformationPartialView').classList.add('hidden');
    if (document.getElementById('deficiencyHistoryPartialView'))
        document.getElementById('deficiencyHistoryPartialView').classList.add('hidden');
    if (document.getElementById('notesPartialView'))
        document.getElementById('notesPartialView').classList.add('hidden');
    if (document.getElementById('finalizePartialView'))
        document.getElementById('finalizePartialView').classList.add('hidden');
    if (document.getElementById('workflowDocumentPartialView'))
        document.getElementById('workflowDocumentPartialView').classList.add('hidden');
    if (document.getElementById('historyPartialView'))
        document.getElementById('historyPartialView').classList.add('hidden');
    if (document.getElementById('requestReleaseBondPartialView'))
        document.getElementById('requestReleaseBondPartialView').classList.add('hidden');
    if (document.getElementById('associatedPartialView'))
        document.getElementById('associatedPartialView').classList.add('hidden');
    if (document.getElementById('entityPartialView'))
        document.getElementById('entityPartialView').classList.add('hidden');
    if (document.getElementById('licensePartialView'))
        document.getElementById('licensePartialView').classList.add('hidden');
    if (document.getElementById('dpsResultsPartialView'))
        document.getElementById('dpsResultsPartialView').classList.add('hidden');
    if (document.getElementById('rfiPartialView'))
        document.getElementById('rfiPartialView').classList.add('hidden');
    if (document.getElementById('bopPartialView'))
        document.getElementById('bopPartialView').classList.add('hidden');
    if (document.getElementById('licenseInformationPartialView'))
        document.getElementById('licenseInformationPartialView').classList.add('hidden');
    if (document.getElementById('complaintPartialView'))
        document.getElementById('complaintPartialView').classList.add('hidden');
    if (document.getElementById('createInvestigationPartialView'))
        document.getElementById('createInvestigationPartialView').classList.add('hidden');
    if (document.getElementById('createPLATPartialView'))
        document.getElementById('createPLATPartialView').classList.add('hidden');
    if (document.getElementById('deficiancyTrailPartialView'))
        document.getElementById('deficiancyTrailPartialView').classList.add('hidden');
    if (document.getElementById('associatedLicensesPartialView'))
        document.getElementById('associatedLicensesPartialView').classList.add('hidden');
    if (document.getElementById('dailyActivityReportPartialView'))
        document.getElementById('dailyActivityReportPartialView').classList.add('hidden');
    if (document.getElementById('dispositionAdminPenaltyPartialView'))
        document.getElementById('dispositionAdminPenaltyPartialView').classList.add('hidden');
    if (document.getElementById('legalApplicationTransactionPartialView'))
        document.getElementById('legalApplicationTransactionPartialView').classList.add('hidden');
    if (document.getElementById('associatedWorkItemsPartialView'))
        document.getElementById('associatedWorkItemsPartialView').classList.add('hidden');
    if (document.getElementById('changeOfLocationDetailsPartialView'))
        document.getElementById('changeOfLocationDetailsPartialView').classList.add('hidden');
    if (document.getElementById('changeOfExpirationDetailsPartialView'))
        document.getElementById('changeOfExpirationDetailsPartialView').classList.add('hidden');
    if (document.getElementById('SurrenderLiceseDetailsPartialView'))
        document.getElementById('SurrenderLiceseDetailsPartialView').classList.add('hidden');
    if (document.getElementById('ChangePremiseOwnershipDetailsPartialView'))
        document.getElementById('ChangePremiseOwnershipDetailsPartialView').classList.add('hidden');
    if (document.getElementById('productRegistrationPartialView'))
        document.getElementById('productRegistrationPartialView').classList.add('hidden');
    if (document.getElementById('destructionRequestPartialView'))
        document.getElementById('destructionRequestPartialView').classList.add('hidden');
    if (document.getElementById('removeSubordinatePartialView'))
        document.getElementById('removeSubordinatePartialView').classList.add('hidden');
    if (document.getElementById('licenseRenewalPartialView'))
        document.getElementById('licenseRenewalPartialView').classList.add('hidden');
    if (document.getElementById('relinquishPermitDetailsPartialView'))
        document.getElementById('relinquishPermitDetailsPartialView').classList.add('hidden');
    if (document.getElementById('changeClassPartialView'))
        document.getElementById('changeClassPartialView').classList.add('hidden');
    if (document.getElementById('requestBondExcemptionPartialView'))
        document.getElementById('requestBondExcemptionPartialView').classList.add('hidden');
    if (document.getElementById('changeBondProviderPartialView'))
        document.getElementById('changeBondProviderPartialView').classList.add('hidden');
    if (document.getElementById('changeDBAPartialView'))
        document.getElementById('changeDBAPartialView').classList.add('hidden');
    if (document.getElementById('refundRequestPartialView'))
        document.getElementById('refundRequestPartialView').classList.add('hidden');
    if (document.getElementById('errorsAndWarningsPartialView'))
        document.getElementById('errorsAndWarningsPartialView').classList.add('hidden');
    if (document.getElementById('ReinstateFromSurrenderDetailsPartialView'))
        document.getElementById('ReinstateFromSurrenderDetailsPartialView').classList.add('hidden');
    if (document.getElementById('changeEntityPartialView'))
        document.getElementById('changeEntityPartialView').classList.add('hidden');
    if (document.getElementById('changeLicenseeNamePartialView'))
        document.getElementById('changeLicenseeNamePartialView').classList.add('hidden');
    if (document.getElementById('changeBrewingAgreementsPartialView'))
        document.getElementById('changeBrewingAgreementsPartialView').classList.add('hidden');
    if (document.getElementById('respondToChangeBondStatusPartialView'))
        document.getElementById('respondToChangeBondStatusPartialView').classList.add('hidden');
    if (document.getElementById('successorInInterestPartialView'))
        document.getElementById('successorInInterestPartialView').classList.add('hidden');
    if (document.getElementById('takeOverContractingLocationPartialView'))
        document.getElementById('takeOverContractingLocationPartialView').classList.add('hidden');
    if (document.getElementById('mergerDetailsPartialView'))
        document.getElementById('mergerDetailsPartialView').classList.add('hidden');
    if (document.getElementById('changeOfPrincipalPartiesPartialView'))
        document.getElementById('changeOfPrincipalPartiesPartialView').classList.add('hidden');
    if (document.getElementById('licApplicationSummaryPartialView'))
        document.getElementById('licApplicationSummaryPartialView').classList.add('hidden');
    if (document.getElementById('temporaryEventNotificationPartialView'))
        document.getElementById('temporaryEventNotificationPartialView').classList.add('hidden');
    if (document.getElementById('claimBusinessePartialView'))
        document.getElementById('claimBusinessePartialView').classList.add('hidden');//Added by Pedram 7/7/2021 
    if (document.getElementById('licenseDetailsPartialView'))
        document.getElementById('licenseDetailsPartialView').classList.add('hidden');
    if (document.getElementById('exciseTaxEmendedReportPartialView'))
        document.getElementById('exciseTaxEmendedReportPartialView').classList.add('hidden');
    if (document.getElementById('exciseTaxEmendedSummaryPartialView'))
        document.getElementById('exciseTaxEmendedSummaryPartialView').classList.add('hidden');
    if (document.getElementById('complianceReportingPartialView'))
        document.getElementById('complianceReportingPartialView').classList.add('hidden');
    if (document.getElementById('demandFundRequestPartialView'))
        document.getElementById('demandFundRequestPartialView').classList.add('hidden');
    if (document.getElementById('CreateInspectionPartialView'))
        document.getElementById('CreateInspectionPartialView').classList.add('hidden');
    if (document.getElementById('LegalDepartmentInformationPartialView'))
        document.getElementById('LegalDepartmentInformationPartialView').classList.add('hidden');
    if (document.getElementById('LegalCaseDetails'))
        document.getElementById('LegalCaseDetails').classList.add('hidden');
    if (document.getElementById('investigationsNotesPartialView'))
        document.getElementById('investigationsNotesPartialView').classList.add('hidden');
    if (document.getElementById('inspectionNotesPartialView'))
        document.getElementById('inspectionNotesPartialView').classList.add('hidden');
    if (document.getElementById('actionHistoryPartialView'))
        document.getElementById('actionHistoryPartialView').classList.add('hidden');
    if (document.getElementById('dvLicenseApplictaionStatus'))
        document.getElementById('dvLicenseApplictaionStatus').classList.add('hidden');
    if (document.getElementById('platNotesPartialView'))
        document.getElementById('platNotesPartialView').classList.add('hidden');
    if (document.getElementById('searchAssociationPartialView'))
        document.getElementById('searchAssociationPartialView').classList.add('hidden');
    if (document.getElementById('platInfoPartialView'))
        document.getElementById('platInfoPartialView').classList.add('hidden');
    if (document.getElementById('investigationsNarrativePartialView'))
        document.getElementById('investigationsNarrativePartialView').classList.add('hidden');
    if (document.getElementById('platHistoryItemPartialView'))
        document.getElementById('platHistoryItemPartialView').classList.add('hidden');
    if (document.getElementById('inspectioNarrativePartialView'))
        document.getElementById('inspectioNarrativePartialView').classList.add('hidden');
    if (document.getElementById('viewInvAssociatedInvestigators'))
        document.getElementById('viewInvAssociatedInvestigators').classList.add('hidden');
    if (document.getElementById('platNarrativePartialView'))
        document.getElementById('platNarrativePartialView').classList.add('hidden');
    if (document.getElementById('platDeterminationPartialView'))
        document.getElementById('platDeterminationPartialView').classList.add('hidden');
    if (document.getElementById('ELFdataPartialView'))
        document.getElementById('ELFdataPartialView').classList.add('hidden');
    if (document.getElementById('CreateELFdataPartialView'))
        document.getElementById('CreateELFdataPartialView').classList.add('hidden');
    if (document.getElementById('EditELFdataPartialView'))
        document.getElementById('EditELFdataPartialView').classList.add('hidden');
    if (document.getElementById('EditInspectionView'))
        document.getElementById('EditInspectionView').classList.add('hidden');
    if (document.getElementById('InspectionViewSummary'))
        document.getElementById('InspectionViewSummary').classList.add('hidden');
    if (document.getElementById('platViewSummaryPartialView'))
        document.getElementById('platViewSummaryPartialView').classList.add('hidden');
    if (document.getElementById('platStatusPartialView'))
        document.getElementById('platStatusPartialView').classList.add('hidden');
    if (document.getElementById('investigators_add'))
        document.getElementById('investigators_add').classList.add('hidden');
    if (document.getElementById('viewInspectionViolations'))
        document.getElementById('viewInspectionViolations').classList.add('hidden');
    if (document.getElementById('viewInspectionAllegations'))
        document.getElementById('viewInspectionAllegations').classList.add('hidden');

    if (view == '') return;
    if (document.getElementById(view) != null)
        document.getElementById(view).classList.remove('hidden');
}

function RenderPartialView(e, selectedTagId = '', ishaveRolePermission = false) {
    var id = (e.srcElement.innerText).trim();
    leftMenuPresentSelectedId = selectedTagId;
    RenderMenuPartialView(id);
    leftMenuPreviousSelectedId = leftMenuPresentSelectedId;
    RenderMenuPartialView(id, ishaveRolePermission);
    return false;
}

function RenderMenuPartialView(id, ishaveRolePermission = false) {
    var workItemType = $("#hdnWorkItemTypeID").val();
    var workItemID = $("#hdnWorkItemID").val();
    var workItemTypeID = $("#hdnWorkItemTypeIDs").val();
    var applicationId = $("#hdnApplicationId").val();
    var isPlatOverview = false;
    parameters = { "WorkitemTypeID": workItemType, "WorkitemID": workItemID }

    //if (workItemType == "COM") {
    //    if (!showComLeftMenuAccess(id)) {
    //        //alert("You don't have permission to access ");
    //        var popupNotification = $("#Notification").data("kendoNotification");
    //        popupNotification.show({ message: "You don't have permission to access this resource." }, "error");
    //        
    //        if (leftMenuPreviousSelectedId) {
    //            //$("#" + leftMenuPreviousSelectedId).addClass("menu-item-active");
    //            //document.getElementById("" + leftMenuPreviousSelectedId + "").classList.add("menu-item-active");
    //            setTimeout(addClassName(leftMenuPreviousSelectedId), 20000); ;
    //        }

    //        //if (leftMenuPresentSelectedId) {
    //        //}
    //        return;
    //    }
    //}

    if (workItemType == 'PLT') {
        ShowLoader();
        switch (id) {
            case 'Overview':
                previewCaseInformation(true);
                isPlatOverview = true;
                break;
            case 'Plat Information':
                previewPLATInfo();
                break;
            case 'Associations':
                previewInvestigationAssociations();
                break;
            case 'Notes':
                previewPLATNotes(applicationId);
                break;
            case PlatHistoryTypes.Person:
            case PlatHistoryTypes.Location:
            case PlatHistoryTypes.License:
                getENF_PLATWorkItemHistory(id);
                break;
            case 'Narrative':
                previewPLATNarrative(applicationId);
                break;
            case 'Investigators':
                previewAssociatedInvestigators();
                break;
            case 'Determination':
                previewPlatDetermination();
                break;
            case 'ELF Data':
                previewELFdata();
                break;
            case 'Status':
                previewPlatStatus();
                break;
            case 'History':
                hideAllPartialViews("");
                previewInvestigationActionHistory();
                return;
                break;
            case 'Actions':
            case 'Create Investigation':
                //Do nothing
                break;
            default:
                HideLoader();
                hideAllPartialViews("tobeimplementedPartialView");
                break;
        }
        //if (id !== 'Create Investigation') {
        //    HideLoader();
        //    return;
        //}
    }
    if (id == "Overview" && isPlatOverview == false) {
        previewCaseInformation(true);
    }
    if (id == "Deficiency History") {
        ShowLoader();
        $.ajax({
            type: "GET",
            url: "/Process/DeficiencyHistory",
            data: { "WorkitemTypeID": workItemTypeID, "WorkitemID": workItemID },
            success: function (data) {
                previewDeficiencyHistory();
                $("#deficiencyHistoryPartialView").html(data);

                $.ajax({
                    type: "GET",
                    url: "/Process/GetDeficiencies?WorkitemID=" + workItemID + "&WorkitemTypeID=" + workItemTypeID,
                    dataType: "json",
                    success: function (results) {
                        $("#deficiencyHistoryResult").empty();
                        $("#deficiencyHistoryResult").kendoGrid({
                            toolbar: ["excel"],
                            excel: {
                                fileName: "Deficiencies History.xlsx",
                                allPages: true,
                            },
                            dataSource: {
                                data: results,
                                schema: {
                                    model: {
                                        fields: {
                                            RFIID: { type: "string" },
                                            DeficinecyRecordId: { type: "number" },
                                            DeficiencyHeadingName: { type: "string" },
                                            RequestText: { type: "string" },
                                            ResponseText: { type: "string" },
                                            DeficiencyStatus: { type: "string" },
                                            CreatedBy: { type: "string" },
                                            DeficiencyStatusId: { type: "number" },
                                            DeficiencyheadingId: { type: "number" },
                                        }
                                    }
                                },
                                pageSize: 5
                            },
                            dataBound: onDataBound,
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
                                { field: "RFIID", title: "RFI ID", hidden: "true" },
                                { field: "DeficinecyRecordId", title: "Deficinecy Record Id", hidden: "true" },
                                { field: "DeficiencyHeadingName", title: "Deficiency Heading", width: 200 },
                                { field: "RequestText", title: "Request", width: 180, hidden: "true" },
                                { field: "ResponseText", title: "Response", width: 180 },
                                { field: "DeficiencyStatus", title: "Deficiency Status", width: 200 },
                                { field: "CreatedBy", title: "Added By", width: 200 },
                                { field: "DeficiencyStatusId", title: "DeficiencyStatusId", hidden: "true" },
                                { field: "DeficiencyheadingId", title: "DeficiencyheadingId", hidden: "true" },
                            ]
                        });
                    },
                    error: function (xhr) {
                    },
                });

            },
        });
        setTimeout(HideLoader, 500);
    }
    if (workItemType != "INS" && workItemType != "PLT" && id == "Notes") {
        if (workItemType == "BOP" && ishaveRolePermission) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "You don't have permission to access this resource." }, "error");
            return false;
        }
        else {
            ShowLoader();
            $.ajax({
                type: "GET",
                url: "/Process/Notes",
                data: { "WorkitemTypeID": workItemTypeID, "WorkitemID": workItemID },
                success: function (data) {
                    previewNotes();
                    $("#notesPartialView").html(data);

                    $.ajax({
                        type: "GET",
                        url: "/Process/GetUserNotesDetails?WorkitemID=" + workItemID + "&WorkitemTypeID=" + workItemTypeID,
                        dataType: "json",
                        success: function (results) {
                            if ($("#hdnLicenseViewAccess").val() == 'True') {
                                if (document.getElementById('btnAddNewNote'))
                                    document.getElementById('btnAddNewNote').classList.add('hidden');

                            }
                            else {
                                if (document.getElementById('btnAddNewNote'))
                                    document.getElementById('btnAddNewNote').classList.remove('hidden');
                            }

                            $("#noteResult").empty();
                            $("#noteResult").kendoGrid({
                                toolbar: ["excel"],
                                excel: {
                                    fileName: "Notes.xlsx",
                                    allPages: true,
                                },
                                dataSource: {
                                    data: results,
                                    schema: {
                                        model: {
                                            fields: {
                                                UserNotesid: { type: "number" },
                                                WorkitemID: { type: "number" },
                                                WorkitemType: { type: "string" },
                                                UserNoteSource: { type: "string" },
                                                Note: { type: "string" },
                                                strNotesAddedDate: { type: "string" },
                                                NotesAddedBy: { type: "string" }
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
                                    { field: "UserNotesid", title: "UserNotes ID", hidden: "true" },
                                    { field: "WorkitemID", title: "Workitem ID", hidden: "true" },
                                    { field: "WorkitemType", title: "Workitem Type", hidden: "true" },
                                    { field: "UserNoteSource", title: "Source", width: 180 },
                                    { field: "Note", title: "Note", width: 200 },
                                    { field: "strNotesAddedDate", title: "Added On", width: 200, format: "{0:g}" },
                                    { field: "NotesAddedBy", title: "Added By", width: 200 },
                                    {
                                        template: function (dataItem) {
                                            // Your condition here
                                            if ($("#hdnLicenseViewAccess").val() == 'True') {
                                                return '';
                                            } else {
                                                return '<a href =# class="btn-edit glyphicon glyphicon-remove js-edit"  title = "Edit" data-customer-id= \'' + dataItem.UserNotesid + '\'> <i class="k-icon k-i-edit"></i></a>';

                                            }
                                        },
                                        field: "UserNotesid",
                                        filterable: false,
                                        sortable: false,
                                        width: 100,
                                        title: "Edit",
                                        headerAttributes: { style: "color: #333; font-size: 15px; font-weight: 600; text-decoration: none;" }
                                    },
                                    {
                                        template: function (dataItem) {
                                            // Your condition here
                                            if ($("#hdnLicenseViewAccess").val() == 'True') {
                                                return '';
                                            } else {
                                                return '<a href =# class=btn-link glyphicon glyphicon-remove js-delete"  title = "Delete" data-customer-id= \'' + dataItem.UserNotesid + '\'> <i class="k-icon k-i-delete"></i></a>';

                                            }
                                        },
                                        field: "UserNotesid",
                                        filterable: false,
                                        sortable: false,
                                        width: 100,
                                        title: "Delete",
                                        headerAttributes: { style: "color: #333; font-size: 15px; font-weight: 600; text-decoration: none;" }
                                    }
                                ]
                            });
                        },
                        error: function (xhr) {
                        },
                    });
                },
            });
            setTimeout(HideLoader, 500);


        }
    }
    if (id == "Finalize") {
        if (workItemType == "BOP" && ishaveRolePermission) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "You don't have permission to access this resource." }, "error");
            return false;
        }
        else {
            ShowLoader();
            $.ajax({
                type: "GET",
                url: "/Process/Finalize",
                data: { "WorkitemType": workItemType, "WorkitemID": workItemID, "WorkitemTypeID": workItemTypeID },
                success: function (data) {
                    previewFinalize();
                    $("#finalizePartialView").html(data);
                },
            });
            setTimeout(HideLoader, 500);
        }
    }
    if (id == "Documents") {
        if (workItemType == "BOP" && ishaveRolePermission) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "You don't have permission to access this resource." }, "error");
            return false;
        }
        else {
            ShowLoader();
            $.ajax({
                type: "GET",
                url: "/Process/WorkflowDocument",
                data: { "workitemType": workItemType, "workitemID": workItemID, "applicationId": applicationId, "WorkItemTypeID": $("#hdnWorkItemTypeIDs").val() },
                success: function (data) {
                    previewWorkflowDocument();
                    $("#workflowDocumentPartialView").html(data);
                    if ($("#hdnLicenseViewAccess").val() == 'True') {
                        if (document.getElementById('addNotes'))
                            document.getElementById('addNotes').classList.add('hidden');

                    }
                    else {
                        if (document.getElementById('addNotes'))
                            document.getElementById('addNotes').classList.remove('hidden');
                    }
                },
            });
            setTimeout(HideLoader, 500);
        }
    }
    if (id == "Application Summary") {
        ShowLoader();
        $.ajax({
            type: "GET",
            url: "/Process/ApplicationSummary",
            data: { "WorkitemTypeID": workItemTypeID, "WorkitemID": workItemID },
            success: function (data) {
                previewApplicationSummary();
                $("#licApplicationSummaryPartialView").html(data);
            },
        });
        setTimeout(HideLoader, 500);
    }
    if (id == "History") {
        ShowLoader();
        $.ajax({
            type: "GET",
            url: "/Process/History",
            data: { "WorkitemTypeID": workItemTypeID, "WorkitemID": workItemID },
            success: function (data) {
                previewHistory();
                $("#historyPartialView").html(data);
                var workitemID = $("#hdnWorkItemID").val();
                var WorkItemType = $("#hdnWorkItemType").val();
                $.ajax({
                    type: "GET",
                    url: "/Process/GetWorkflowHistory?WorkItemID=" + workitemID + "&WorkItemTypeID=" + workItemTypeID,
                    dataType: "json",
                    success: function (results) {
                        $("#WorkFlowGrid").empty();
                        $("#WorkFlowGrid").kendoGrid({
                            toolbar: ["excel"],
                            excel: {
                                fileName: "History.xlsx",
                                allPages: true,
                            },
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
                                { field: "WFWorkItemHistoryID", title: "WFWorkItemHistoryID", hidden: "true" },
                                { field: "WorkItemID", title: "WorkItemID", hidden: "true" },
                                { field: "WorkItemTypeID", title: "WorkItemTypeID", hidden: "true" },
                                { field: "WorkflowActionID", title: "WorkflowActionID", hidden: "true" },
                                { field: "WorkFlowActionType", title: "Workflow Action", width: 200 },
                                { field: "WorkflowActionNotes", title: "Action Notes", width: 200, encoded: false },
                                { field: "ActionBy", title: "Action By", width: 200 },
                                { field: "ActionDate", title: "Action Date", width: 200, format: "{0:g}" }
                            ]
                        });
                    },
                    error: function (xhr) {
                    },
                });

            },
        });
        setTimeout(HideLoader, 500);
    }
    //
    //if (id == "License/Application Status") {
    //    ShowLoader();
    //    $.ajax({
    //        type: "POST",
    //        url: "/Enforcement/GetLicenseApplicationStatus",
    //        data: { "WorkItemID": WorkItemID, "LicenseID": LicenseID },
    //        success: function (data) {
    //            if (data != null) {
    //                hideAllPartialViews('licenseApplicationStatusPartialView');
    //                $("#licenseApplicationStatusPartialView").html(data);
    //                $("#licenseApplicationStatusGrid").empty();
    //                $("#licenseApplicationStatusGrid").kendoGrid({
    //                    toolbar: ["excel"],
    //                    excel: {
    //                        fileName: "LicenseApplicationStatus.xlsx",
    //                        allPages: true,
    //                    },
    //                    dataSource: {
    //                        data: data,
    //                        schema: {
    //                            model: {
    //                                fields: {
    //                                    LicenseID: { type: "number" },
    //                                    ApplicationID: { type: "number" },
    //                                    Status: { type: "number" },
    //                                    CreatedDate: { type: "string" },
    //                                    CreatedBy: { type: "number" },

    //                                }
    //                            }
    //                        },
    //                        pageSize: 5
    //                    },
    //                    scrollable: true,
    //                    sortable: true,
    //                    pageable:
    //                    {
    //                        pageSizes: [5, 10, 20],
    //                        numeric: false
    //                    },
    //                    filterable: {
    //                        extra: false,
    //                        operators: {
    //                            string: {
    //                                startswith: "Starts with",
    //                                eq: "Is equal to",
    //                                neq: "Is not equal to"
    //                            }
    //                        }
    //                    },
    //                    columns: [
    //                        { field: "LicenseID", title: "LicenseID" },
    //                        { field: "ApplicationID", title: "ApplicationID" },
    //                        { field: "Status", title: "Status" },
    //                        { field: "CreatedDate", title: "CreatedDate" },
    //                        { field: "CreatedBy", title: "CreatedBy", width: 200 },

    //                    ]
    //                });
    //            }

    //        }
    //        });







    //}
    if (id == "Associated Workitems") {
        //$.ajax({
        //    type: "GET",
        //    url: "/Process/Notes",
        //    data: { "WorkitemTypeID": workItemType, "WorkitemID": workItemID },
        //    success: function (data) {
        //        previewNotes();
        //        $("#notesPartialView").html(data);
        //    },
        //});
    }
    if (id == "Associated Licenses") {
        ShowLoader();
        $.ajax({
            type: "GET",
            url: "/Process/AssociatedLicenses",
            data: { "WorkitemTypeID": workItemType, "WorkitemID": workItemID },
            success: function (data) {
                previewAssociatedLicenses();
                $("#associatedLicensesPartialView").html(data);
                var workitemID = $("#hdnWorkItemID").val();
                var WorkItemType = $("#hdnWorkItemTypeID").val();
                $.ajax({
                    type: "GET",
                    url: "/Process/GetAssociatedLicenses?WorkItemID=" + workitemID + "&WorkItemTypeID=" + workItemTypeID,
                    dataType: "json",
                    success: function (results) {
                        $("#LicensesGrid").empty();
                        $("#LicensesGrid").kendoGrid({
                            toolbar: ["excel"],
                            excel: {
                                fileName: "Licenses.xlsx",
                                allPages: true,
                            },
                            dataSource: {
                                data: results,
                                schema: {
                                    model: {
                                        fields: {
                                            ApplicationSubType: { type: "string" },
                                            LicenseId: { type: "number" },
                                            ApplicationStatus: { type: "string" },
                                            DBA: { type: "string" },
                                            City: { type: "string" },
                                            LicSecondaryStatus: { type: "string" }
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
                                { field: "ApplicationSubType", title: "License Type", width: 200 },
                                { field: "LicenseId", title: "License Id", width: 200 },
                                { field: "ApplicationStatus", title: "License Status", width: 180, template: "#= LicSecondaryStatus == '' ? ApplicationStatus : ApplicationStatus+ ' - '+ LicSecondaryStatus#" },
                                { field: "DBA", title: "DBA", width: 200 },
                                { field: "City", title: "City", width: 130 }
                            ],
                            selectable: "row",
                            change: function (e) {
                                var selectedRows = this.select();
                                var rowData = this.dataItem(selectedRows[0]);
                                renderLicenseInformation(rowData.LicenseId);

                            }
                        });
                    },
                    error: function (xhr) {
                    },
                });

            },
        });
        setTimeout(HideLoader, 500);
    }
    if (id == "Entity Information") {
        if (workItemType == "BOP" && ishaveRolePermission) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "You don't have permission to access this resource." }, "error");
            return false;
        }
        else {
            ShowLoader();
            $.ajax({
                type: "GET",
                url: "/Process/EntityInformation",
                data: { "WorkitemTypeID": workItemTypeID, "WorkitemID": workItemID },
                success: function (data) {
                    previewEntity();
                    $("#entityPartialView").html(data);

                    $.ajax({
                        type: "GET",
                        url: "/Process/GetPrincipalParties",
                        dataType: "json",
                        success: function (results) {
                            $("#associatedPersonsGrid").empty();
                            $("#AssociatedPersonsGrid").kendoGrid({
                                toolbar: ["excel"],
                                excel: {
                                    fileName: "Principal Parties.xlsx",
                                    allPages: true,
                                },
                                dataSource: {
                                    data: results,
                                    schema: {
                                        model: {
                                            fields: {
                                                EntityName: { type: "string" },
                                                EntityType: { type: "string" },
                                                strRole: { type: "string" },
                                                PercentageOfOwnership: { type: "nymber" },
                                                ParentCompany: { type: "string" },
                                                PrincipalPartyID: { type: "number" },
                                                PPEntityRoleID: { type: "number" },
                                                PersonOrBusinessID: { type: "number" },
                                            }
                                        }
                                    },
                                    pageSize: 5
                                },
                                scrollable: false,
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
                                    { field: "EntityName", title: "Name", width: "20%" },
                                    { field: "EntityType", title: "Type", width: "25%" },
                                    { field: "strRole", title: "Role", width: "25%" },
                                    { field: "PercentageOfOwnership", title: "Ownership", width: "20%", format: "{0:p}" },
                                    { field: "ParentCompany", title: "Principal(s) Of​", width: "25%" },
                                    { field: "PrincipalPartyID", hidden: "true" },
                                    { field: "PPEntityRoleID", hidden: "true" },
                                    { field: "PersonOrBusinessID", hidden: "true" },
                                ]
                            });
                        },
                        error: function (xhr) {
                        },
                    });

                },
            });
            setTimeout(HideLoader, 500);
        }
    }
    if (id == "License Details" && workItemType == "EXC") {
        $.ajax({
            type: "GET",
            url: "/Process/LicenseDetailsForExciseTax",
            data: { "WorkitemTypeID": workItemTypeID, "WorkitemID": workItemID },
            success: function (data) {
                previewLicenseDetails();
                $("#licenseDetailsPartialView").html(data);
            },
        });
    }

    //Added By Pedram 9/2/2021
    if (id == "License Details" && workItemType == "BOP") {
        if (ishaveRolePermission) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "You don't have permission to access this resource." }, "error");
            return false;
        }
        else {
            ShowLoader();
            $.ajax({
                type: "GET",
                url: "/Process/LicenseDetailsForBOP",
                data: { "WorkitemTypeID": workItemTypeID, "WorkitemID": workItemID },
                success: function (data) {
                    previewLicenseDetails();
                    $("#licenseDetailsPartialView").html(data);
                },
            });
            setTimeout(HideLoader, 500);
        }
    }

    //if (id == "License Details") {
    //    
    //    //$.ajax({
    //    //    type: "GET",
    //    //    url: "/Process/Notes",
    //    //    data: { "WorkitemTypeID": workItemType, "WorkitemID": workItemID },
    //    //    success: function (data) {
    //    //        previewNotes();
    //    //        $("#notesPartialView").html(data);
    //    //    },
    //    //});
    //}
    if (id == "DPSResults") {
        ShowLoader();
        $.ajax({
            type: "GET",
            url: "/Process/dpsResults",
            success: function (data) {
                previewDPS();
                $("#dpsResultsPartialView").html(data);
                $.ajax({
                    type: "GET",
                    url: "/Process/GetDPSRequestInfo",
                    dataType: "json",
                    data: { "ApplicationID": applicationId },
                    success: function (data) {
                        $("#dpsResults").empty();
                        $("#dpsResults").kendoGrid({
                            toolbar: ["excel"],
                            excel: {
                                fileName: "DPSResults.xlsx",
                                allPages: true,
                            },
                            dataSource: {
                                data: data,
                                schema: {
                                    model: {
                                        fields: {
                                            PersonID: { type: "string" },
                                            FName: { type: "string" },
                                            MName: { type: "string" },
                                            LName: { type: "string" },
                                            Role: { type: "string" },
                                            status: { type: "string" },
                                            message: { type: "string" },
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
                                responsive: false,
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
                                { field: "FName", title: "First Name", width: 160 },
                                { field: "MName", title: "Middle Name", width: 160 },
                                { field: "LName", title: "Last Name", width: 160 },
                                { field: "Role", title: "Role", width: 280 },
                                { field: "status", title: "Status", width: 120 },
                                /*{ field: "message", title: "Message", width: 200 },*/
                                {
                                    field: "PersonID",
                                    filterable: false,
                                    sortable: false,
                                    title: "DPS Run",
                                    width: 120,
                                    template: '<button id="btn-#=PersonID#" value="#=PersonID#" onclick="RunDPS(event)" class="btn btn-primary btn-custom w-lg waves-effect waves-light m-b-5 xs-pull-center exportpdf" type="button" id="btn-Record-Back"><i class="k-icon k-i-search"/></button>',
                                    headerAttributes: {
                                        style: "color: #333; font-size:15px; font-weight:600; text-decoration: none;"
                                    }
                                }
                            ]
                        });
                    },
                });
            },
        });
        setTimeout(HideLoader, 500);
    }
    if (id == "Request For Information") {
        ShowLoader();
        var defStatusCode = "Draft";
        $.ajax({
            type: "GET",
            url: "/Process/RequestForInformation",
            data: { "WorkitemTypeID": workItemTypeID, "WorkitemID": workItemID },
            success: function (data) {

                previewRFI();
                $("#rfiPartialView").html(data);

                $.ajax({
                    type: "GET",
                    url: "/Process/GetDeficiencies?WorkitemID=" + workItemID + "&WorkitemTypeID=" + workItemTypeID + "&DeficiencyStatusCode=" + defStatusCode,
                    dataType: "json",
                    success: function (results) {
                        if ($("#hdnLicenseViewAccess").val() == 'True') {
                            if (document.getElementById('btnAddRecord'))
                                document.getElementById('btnAddRecord').classList.add('hidden');

                            if (document.getElementById('btnNext'))
                                document.getElementById('btnNext').classList.add('hidden');

                        }
                        $("#rFIDeficiencyHistoryResult").empty();
                        var grid = $("#rFIDeficiencyHistoryResult").kendoGrid({
                            dataSource: {
                                data: results,
                                schema: {
                                    model: {
                                        fields: {
                                            RFIID: { type: "string" },
                                            DeficinecyRecordId: { type: "number" },
                                            DeficiencyHeadingName: { type: "string" },
                                            RequestText: { type: "string" },
                                            DeficiencyStatus: { type: "string" },
                                            CreatedBy: { type: "string" },
                                            DeficiencyStatusId: { type: "number" },
                                            DeficiencyheadingId: { type: "number" },
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
                                { template: "<input type='checkbox' class='checkbox' onclick = selectRow(this) />", width: 80 },
                                { field: "RFIID", title: "RFI ID", hidden: "true" },
                                { field: "DeficinecyRecordId", title: "Deficinecy Record Id", hidden: "true" },
                                { field: "DeficiencyHeadingName", title: "Deficiency Heading", width: 200 },
                                { field: "RequestText", title: "Request Text", width: 200 },
                                { field: "DeficiencyStatus", title: "Deficiency Status", width: 200 },
                                { field: "CreatedBy", title: "Added By", width: 180 },
                                { field: "DeficiencyStatusId", title: "DeficiencyStatusId", hidden: "true" },
                                { field: "DeficiencyheadingId", title: "DeficiencyheadingId", hidden: "true" },
                                {
                                    template: function (dataItem) {
                                        let actionTemplate = '';
                                        if ($('#hdnLicenseViewAccess').val() != 'undefined' && $("#hdnLicenseViewAccess").val() != 'True')
                                            actionTemplate += "<a href='' class='btn-defEdit glyphicon glyphicon-remove js-edit' title='Edit' data-customer-id= #: DeficinecyRecordId #><i class='k-icon k-i-edit'></i></a>";
                                        return actionTemplate;
                                    },
                                    field: "DeficinecyRecordId",
                                    title: "&nbsp;",
                                    filterable: false,
                                    sortable: false,
                                    width: 80
                                },
                                {
                                    template: function (dataItem) {
                                        let actionTemplate = '';
                                        if ($('#hdnLicenseViewAccess').val() != 'undefined' && $("#hdnLicenseViewAccess").val() != 'True')
                                            actionTemplate += "<a href='' class='btn-delLink glyphicon glyphicon-remove js-delete' title='Delete' data-customer-id= #: DeficinecyRecordId #><i class='text-danger k-icon k-i-delete'></i></a>";
                                        return actionTemplate;
                                    },
                                    field: "DeficinecyRecordId",
                                    title: "&nbsp;",
                                    filterable: false,
                                    sortable: false,
                                    width: 80
                                }
                            ]
                        });

                        if ($("#hdnLicenseViewAccess").val() == 'True') {
                            if (document.getElementById('btnAddRecord'))
                                document.getElementById('btnAddRecord').classList.add('hidden');

                            if (document.getElementById('btnNext'))
                                document.getElementById('btnNext').classList.add('hidden');

                        }
                        


                    },
                    error: function (xhr) {
                    },
                });
            },
        });
        setTimeout(HideLoader, 500);
    }
    if (id == "Information" && workItemType == "BOP") {
        ShowLoader();
        $.ajax({
            type: "GET",
            url: "/Process/BreachofPeaceInformation",
            data: { "WorkitemTypeID": workItemType, "WorkitemID": workItemID },
            success: function (data) {

                previewBOPData();
                $("#bopPartialView").html(data);
            },
        });
        setTimeout(HideLoader, 500);
    }
    if (id == "Information" && workItemType == "DAR") {
        ShowLoader();
        $.ajax({
            type: "GET",
            url: "/Process/DailyActivityReport",
            data: { "WorkitemTypeID": workItemType, "WorkitemID": workItemID },
            success: function (data) {
                previewDARData();
                $("#dailyActivityReportPartialView").html(data);
            },
        });
        setTimeout(HideLoader, 500);
    }
    if (id == "Information" && workItemType == "PNY") {
        ShowLoader();
        $.ajax({
            type: "GET",
            url: "/Process/DispositionAdminPenalty",
            data: { "WorkitemTypeID": workItemType, "WorkitemID": workItemID },
            success: function (data) {
                previewAdminPenaltyData();
                $("#dispositionAdminPenaltyPartialView").html(data);
            },
        });
        setTimeout(HideLoader, 500);
    }
    if (id == "Information" && workItemType == "LEG") {
        ShowLoader();
        $.ajax({
            type: "GET",
            url: "/Process/LegalApplicationTransaction",
            data: { "WorkitemTypeID": workItemType, "WorkitemID": workItemID },
            success: function (data) {
                previewLegalApplicationTransactionData();
                $("#legalApplicationTransactionPartialView").html(data);
            },
        });
        setTimeout(HideLoader, 500);
    }
    if ((id == "Complaint Information" || id == "Protest Information") && workItemType == "COM") {
        ShowLoader();
        $.ajax({
            type: "GET",
            url: "/Process/Complaint",
            data: { "WorkitemTypeID": workItemType, "WorkitemID": workItemID },
            success: function (data) {

                previewComplaintData();
                $("#complaintPartialView").html(data);
            },
        });
        setTimeout(HideLoader, 500);
    }
    if ((id == "Associated Workitems") && workItemType == "COM") {
        ShowLoader();
        //$.ajax({
        //    type: "GET",
        //    url: "/Process/Complaint",
        //    data: { "WorkitemTypeID": workItemType, "WorkitemID": workItemID },
        //    success: function (data) {

        //        previewComplaintData();
        //        $("#complaintPartialView").html(data);
        //    },
        //});
        AssociatedWorkitems();
        setTimeout(HideLoader, 500);
    }
    if (id == "Create Investigation") {
        if (workItemType == "BOP" && ishaveRolePermission) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "You don't have permission to access this resource." }, "error");
            return false;
        }
        else {
            ShowLoader();
            var applicationId = $("#hdnApplicationId").val();
            $.ajax({
                type: "GET",
                url: "/Process/CreateInvestigation",
                data: { "WorkitemTypeID": workItemType, "WorkitemID": workItemID },
                success: function (data) {
                    $.ajax({
                        type: "GET",
                        url: "/Enforcement/GetComplaintByID?ComplaintID=" + applicationId,
                        success: function (data) {
                            if (data != null) {
                                document.getElementById('viewApplicationID').innerHTML = applicationId;

                                if (data.ComplaintDescription == "Protest") {
                                    document.getElementById("hdnIsProtest").value = true;
                                }
                                else {
                                    document.getElementById("hdnIsProtest").value = false;
                                }

                            }
                        },
                        error: function (xhr) {
                            var popupNotification = $("#Notification").data("kendoNotification");
                            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
                        },
                    });

                    $("#createInvestigationPartialView").html(data);
                    hideAllPartialViews('createInvestigationPartialView');
                    setTimeout(function () {
                        if (isClosed())
                            document.getElementById('btnAddNew').classList.add('hidden');
                        else
                            document.getElementById('btnAddNew').classList.remove('hidden');
                    }, 500);
                },
            });
            setTimeout(HideLoader, 500);
        }
    }
    if (id == "Create PLAT") {
        ShowLoader();
        var applicationId = $("#hdnApplicationId").val();
        $.ajax({
            type: "GET",
            url: "/Process/CreatePLAT",
            data: { "WorkitemTypeID": workItemType, "WorkitemID": workItemID },
            success: function (data) {
                $.ajax({
                    type: "GET",
                    url: "/Process/GetApplicationDetailsByID?ApplicationId=" + applicationId,
                    success: function (data) {
                        var applicationSubType = $("#hdnApplicationSubTypeForPLAT").val();
                        if (data != null) {
                            document.getElementById('viewApplicationIDForPLAT').innerHTML = applicationId;
                            document.getElementById('viewLicensetypeForPLAT').innerHTML = applicationSubType;
                        }
                    },
                    error: function (xhr) {
                        var popupNotification = $("#Notification").data("kendoNotification");
                        popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
                    },
                });

                $("#createPLATPartialView").html(data);
                hideAllPartialViews('createPLATPartialView');
            },
        });
        setTimeout(HideLoader, 500);
    }
    if (id == "Associated Workitems") {

        ShowLoader();
        AssociatedWorkitems();
        setTimeout(HideLoader, 500);
    }
    if (id == "Change of Location") {
        ShowLoader();
        $.ajax({
            type: "GET",
            url: "/Process/ChangeOfLocationDetails",
            data: { "WorkitemTypeID": workItemTypeID, "WorkitemID": workItemID },
            success: function (data) {
                hideAllPartialViews('changeOfLocationDetailsPartialView');
                $("#changeOfLocationDetailsPartialView").html(data);
            },
        });
        setTimeout(HideLoader, 500);
    }
    if (id == "Change Of Expiration") {
        ShowLoader();
        $.ajax({
            type: "GET",
            url: "/Process/ChangeOfExpiration",
            data: { "WorkitemTypeID": workItemTypeID, "WorkitemID": workItemID },
            success: function (data) {
                hideAllPartialViews('changeOfExpirationDetailsPartialView');
                $("#changeOfExpirationDetailsPartialView").html(data);
            },
        });
        setTimeout(HideLoader, 500);
    }
    if (id == "Temporary Surrender") {
        ShowLoader();
        $.ajax({
            type: "GET",
            url: "/Process/SurrenderLicenseDetails",
            data: { "WorkitemTypeID": workItemTypeID, "WorkitemID": workItemID },
            success: function (data) {
                hideAllPartialViews('SurrenderLiceseDetailsPartialView');
                $("#SurrenderLiceseDetailsPartialView").html(data);
            },
        });
        setTimeout(HideLoader, 500);
    }
    if (id == "Change of Premise Ownership") {
        ShowLoader();
        $.ajax({
            type: "GET",
            url: "/Process/ChangePremiseOwnershipDetails",
            data: { "WorkitemTypeID": workItemTypeID, "WorkitemID": workItemID },
            success: function (data) {
                hideAllPartialViews('ChangePremiseOwnershipDetailsPartialView');
                $("#ChangePremiseOwnershipDetailsPartialView").html(data);
            },
        });
        setTimeout(HideLoader, 500);
    }
    if (id == "Information" && workItemType == "DSR") {
        ShowLoader();
        $.ajax({
            type: "GET",
            url: "/Process/DestructionRequest",
            data: { "WorkitemTypeID": workItemType, "WorkitemID": workItemID },
            success: function (data) {
                previewDesctructionRequestData();
                $("#destructionRequestPartialView").html(data);
            },
        });
        setTimeout(HideLoader, 500);
    }
    if (id == "Product Registration") {
        ShowLoader();
        $.ajax({
            type: "GET",
            url: "/Process/ProductRegistration",
            data: { "WorkitemTypeID": workItemTypeID, "WorkitemID": workItemID },
            success: function (data) {
                hideAllPartialViews('productRegistrationPartialView');
                $("#productRegistrationPartialView").html(data);
            },
        });
        setTimeout(HideLoader, 500);
    }
    if (id == "Change Of Trade Name") {
        ShowLoader();
        $.ajax({
            type: "GET",
            url: "/Process/ChangeDBALicenseDetails",
            data: { "WorkitemTypeID": workItemTypeID, "WorkitemID": workItemID },
            success: function (data) {
                hideAllPartialViews('changeDBAPartialView');
                $("#changeDBAPartialView").html(data);
            },
        });
        setTimeout(HideLoader, 500);
    }
    if (id == "License Renewal") {
        ShowLoader();
        $.ajax({
            type: "GET",
            url: "/Process/ChangeLicenseRenewalDetails",
            data: { "WorkitemTypeID": workItemTypeID, "WorkitemID": workItemID },
            success: function (data) {
                hideAllPartialViews('licenseRenewalPartialView');
                $("#licenseRenewalPartialView").html(data);
            },
        });
        setTimeout(HideLoader, 500);
    }
    if (id == "Compliance Report" && workItemType == "ACR") {
        ShowLoader();
        $.ajax({
            type: "GET",
            url: "/Process/ComplianceReport",
            data: { "WorkitemTypeID": workItemType, "WorkitemID": workItemID },
            success: function (data) {
                previewComplianceReportingData();
                $("#complianceReportingPartialView").html(data);
            },
        });
        setTimeout(HideLoader, 500);
    }
    if (id == "Demand Fund Request" && workItemType == "DFR") {
        ShowLoader();
        $.ajax({
            type: "GET",
            url: "/Process/DemandFundRequest",
            data: { "WorkitemTypeID": workItemType, "WorkitemID": workItemID },
            success: function (data) {
                previewDemandFundRequestData();
                $("#demandFundRequestPartialView").html(data);
            },
        });
        setTimeout(HideLoader, 500);
    }
    if (id == "Remove Subordinate") {
        ShowLoader();
        $.ajax({
            type: "GET",
            url: "/Process/GetRemoveSubordinateDetails",
            data: { "WorkitemTypeID": workItemTypeID, "WorkitemID": workItemID },
            success: function (data) {
                hideAllPartialViews('removeSubordinatePartialView');
                $("#removeSubordinatePartialView").html(data);
            },
        });
        setTimeout(HideLoader, 500);
    }
    if (id == "Surrender License") {
        ShowLoader();
        $.ajax({
            type: "GET",
            url: "/Process/RelinquishPermitDetails",
            data: { "WorkitemTypeID": workItemTypeID, "WorkitemID": workItemID },
            success: function (data) {
                hideAllPartialViews('relinquishPermitDetailsPartialView');
                $("#relinquishPermitDetailsPartialView").html(data);
            },
        });
        setTimeout(HideLoader, 500);
    }
    if (id == "Error & Warning") {
        ShowLoader();

        var workItemID = $("#hdnWorkItemID").val();
        var workItemTypeID = $("#hdnWorkItemTypeIDs").val();
        $.ajax({
            type: "GET",
            url: "/Process/ValidateErroWarning",
            data: { "workItemId": workItemID, "workItemTypeId": workItemTypeID },
            success: function (data) {

                $("#divFormHeading").show();
                $("#divValidateFooter").hide();
                hideAllPartialViews('errorsAndWarningsPartialView');
                $("#errorsAndWarningsPartialView").html(data);
                //$("#divNoRecordFound").show();
            },
        });
        setTimeout(HideLoader, 500);
    }
    if (id == "Change Of Class") {
        ShowLoader();
        $.ajax({
            type: "GET",
            url: "/Process/ChangeOfClass",
            data: { "WorkitemTypeID": workItemTypeID, "WorkitemID": workItemID },
            success: function (data) {
                hideAllPartialViews('changeClassPartialView');
                $("#changeClassPartialView").html(data);
            },
        });
        setTimeout(HideLoader, 500);
    }
    if (id == "Change Bond Provider") {
        ShowLoader();
        $.ajax({
            type: "GET",
            url: "/Process/ChangeOfBondDetails",
            data: { "WorkitemTypeID": workItemTypeID, "WorkitemID": workItemID },
            success: function (data) {
                hideAllPartialViews('changeBondProviderPartialView');
                $("#changeBondProviderPartialView").html(data);
            },
        });
        setTimeout(HideLoader, 500);
    }
    if (id == "Request For Exemption") {
        ShowLoader();
        $.ajax({
            type: "GET",
            url: "/Process/RequestForExemption",
            data: { "WorkitemTypeID": workItemTypeID, "WorkitemID": workItemID },
            success: function (data) {
                hideAllPartialViews('requestBondExcemptionPartialView');
                $("#requestBondExcemptionPartialView").html(data);
            },
        });
        setTimeout(HideLoader, 500);
    }
    if (id == "Change Of Entity") {
        ShowLoader();
        $.ajax({
            type: "GET",
            url: "/Process/ChangeOfEntity",
            data: { "WorkitemTypeID": workItemTypeID, "WorkitemID": workItemID },
            success: function (data) {
                hideAllPartialViews('changeEntityPartialView');
                $("#changeEntityPartialView").html(data);
            },
        });
        setTimeout(HideLoader, 500);
    }
    if (id == "Change Business Entity Name") {

        ShowLoader();
        $.ajax({
            type: "GET",
            url: "/Process/ChangeLicenseeName",
            data: { "WorkitemTypeID": workItemTypeID, "WorkitemID": workItemID },
            success: function (data) {
                hideAllPartialViews('changeLicenseeNamePartialView');
                $("#changeLicenseeNamePartialView").html(data);
            },
        });
        setTimeout(HideLoader, 500);
    }

    /*Added By Pedram 7/7/2021*/
    if (id == "Claiming Business") {

        ShowLoader();
        $.ajax({
            type: "GET",
            url: "/Process/ClaimBusinessInformation",
            data: { "ApplicationId": applicationId },
            success: function (data) {
                hideAllPartialViews('claimBusinessePartialView');
                $("#claimBusinessePartialView").html(data);
            },
        });
        setTimeout(HideLoader, 500);
    }
    if (id == "Reinstate from Surrender") {
        ShowLoader();
        $.ajax({
            type: "GET",
            url: "/Process/ReinstateFromSurrender",
            data: { "WorkitemTypeID": workItemTypeID, "WorkitemID": workItemID },
            success: function (data) {
                hideAllPartialViews('ReinstateFromSurrenderDetailsPartialView');
                $("#ReinstateFromSurrenderDetailsPartialView").html(data);
            },
        });
        setTimeout(HideLoader, 500);
    }
    if (id == "Change of Brewing Agreements") {
        ShowLoader();
        $.ajax({
            type: "GET",
            url: "/Process/ChangeOfBrewingAgreements",
            data: { "WorkitemTypeID": workItemTypeID, "WorkitemID": workItemID },
            success: function (data) {
                hideAllPartialViews('changeBrewingAgreementsPartialView');
                $("#changeBrewingAgreementsPartialView").html(data);
            },
        });
        setTimeout(HideLoader, 500);
    }
    if (id == "Request Supplement Bond") {
        ShowLoader();
        $.ajax({
            type: "GET",
            url: "/Process/RespondToChangeBondStatus",
            data: { "WorkitemTypeID": workItemTypeID, "WorkitemID": workItemID },
            success: function (data) {
                hideAllPartialViews('respondToChangeBondStatusPartialView');
                $("#respondToChangeBondStatusPartialView").html(data);
            },
        });
        setTimeout(HideLoader, 500);
    }
    if (id == "Case Details") {
        ShowLoader();
        $.ajax({
            type: "GET",
            url: "/Process/GetLegalCaseDetails",
            data: { "applicationId": applicationId },
            success: function (data) {
                previewLegalCaseInformation();
                $("#LegalCaseDetails").html(data);
            },
        });
        setTimeout(HideLoader, 2500);
    }
    if (id == "Internal Details") {
        ShowLoader();
        $.ajax({
            type: "GET",
            url: "/Process/GetLegalDepartmentInformation",
            data: { "applicationId": applicationId },
            success: function (data) {
                previewLegalDepartmentInformation();
                $("#LegalDepartmentInformationPartialView").html(data);
            },
        });
        setTimeout(HideLoader, 2500);
    }
    if (id == "Successor in Interest") {
        ShowLoader();
        $.ajax({
            type: "GET",
            url: "/Process/SuccessorInInterest",
            data: { "WorkitemTypeID": workItemTypeID, "WorkitemID": workItemID },
            success: function (data) {
                hideAllPartialViews('successorInInterestPartialView');
                $("#successorInInterestPartialView").html(data);
            },
        });
        setTimeout(HideLoader, 500);
    }
    if (id == "Request for location takeover") {
        ShowLoader();
        $.ajax({
            type: "GET",
            url: "/Process/TakeOverContractingLocationDetails",
            data: { "WorkitemTypeID": workItemTypeID, "WorkitemID": workItemID },
            success: function (data) {
                previewtakeOverContractingLocation();
                $("#takeOverContractingLocationPartialView").html(data);

                $.ajax({
                    type: "GET",
                    url: "/Process/GetTakeOverContractingLocationGridData?WorkitemID=" + workItemID + "&WorkitemTypeID=" + workItemTypeID,
                    dataType: "json",
                    success: function (results) {
                        $("#takeOverContractingLocationGrid").empty();
                        $("#takeOverContractingLocationGrid").kendoGrid({
                            toolbar: ["excel"],
                            excel: {
                                fileName: "Notes.xlsx",
                                allPages: true,
                            },
                            dataSource: {
                                data: results.Data,
                                schema: {
                                    model: {
                                        fields: {
                                            LicenseId: { type: "number" },
                                            StrLicenseType: { type: "string" },
                                            ApplicationStatus: { type: "string" },
                                            DBA: { type: "string" },
                                            ExpirationDate: { type: "string" },
                                            City: { type: "string" },
                                            State: { type: "string" },
                                            Zip: { type: "string" },
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
                            filterable: true,
                            columnMenu: {
                                componentType: "modern",
                                columns: {
                                    sort: "asc",
                                    groups: [
                                        { title: "Address", columns: ["City", "State", "Zip"] },
                                        { title: "Basic Info ", columns: ["LicenseId", "StrLicenseType", "ApplicationStatus", "DBA", "ExpirationDate"] },
                                    ]
                                }
                            },
                            columns: [
                                { field: "LicenseId", title: "License #", width: '20%' },
                                { field: "StrLicenseType", title: "License Type", width: '20%' },
                                { field: "ApplicationStatus", title: "License Status", width: '20%' },
                                { field: "DBA", title: "Doing Business As", width: '20%' },
                                { field: "ExpirationDate", title: "Expiration Date", width: '20%', template: "#= ExpirationDate == null ? 'N/A' : kendo.toString(kendo.parseDate(ExpirationDate, 'MM/dd/yyyy'),'MM/dd/yyyy') #" },
                                { field: "City", title: "City", width: '15%', hidden: true },
                                { field: "State", title: "State", width: '10%', hidden: true },
                                { field: "Zip", title: "Zip", width: '10%', hidden: true },
                            ]
                        });
                    },
                    error: function (xhr) {
                    },
                });
            },
        });
        setTimeout(HideLoader, 500);
    }
    if (id == "Change Of Principal(s)") {
        ShowLoader();
        $.ajax({
            type: "GET",
            url: "/Process/ChangeOfPrincipalParties",
            data: { "WorkitemTypeID": workItemTypeID, "WorkitemID": workItemID },
            success: function (data) {
                previewChangeOfPrincipalParties();
                $("#changeOfPrincipalPartiesPartialView").html(data);
                $.ajax({
                    type: "GET",
                    url: "/Process/ChangeOfPrincipalPartiesGridData?applicationId=" + applicationId,
                    dataType: "json",
                    success: function (results) {
                        $("#updatePrincipalGrid").empty();
                        $("#updatePrincipalGrid").kendoGrid({
                            toolbar: ["excel"],
                            excel: {
                                fileName: "UpdatePrincipalGrid.xlsx",
                                allPages: true,
                            },
                            dataSource: {
                                data: results.Data,
                                schema: {
                                    model: {
                                        fields: {
                                            //  PPEntityName: { type: "string" },
                                            PPEntityType: { type: "string" },
                                            strRole: { type: "string" },
                                            PercentageOfOwnership: { type: "string" },
                                            IsCompleted: { type: "string" },
                                            Action: { type: "string" },
                                            PrincipalPartyID: { type: "number" },
                                            PPEntityRoleID: { type: "number" },
                                            PersonOrBusinessID: { type: "number" },
                                        }
                                    }
                                },
                                pageSize: 5
                            },
                            scrollable: true,
                            sortable: true,
                            groupable: true,
                            pageable:
                            {
                                pageSizes: [5, 10, 20],
                                numeric: false
                            },
                            filterable: true,

                            columns: [
                                // { field: "ParentEntityName", title: "Parent Entity", width: '20%' },
                                { field: "PPEntityName", title: "Name", width: '15%' },
                                { field: "PPEntityType", title: "Type", width: '10%' },
                                { field: "strRole", title: "Role", width: '15%' },
                                {
                                    field: "OwnerShipPercent", title: "Ownership", width: '8%', template: "#=OwnerShipPercent#%", attributes: {
                                        style: "text-align: center;"
                                    }
                                },
                                //{ field: "IsCompleted", title: "Status", width: '10%', template: "#= IsCompleted == false || IsCompleted == null ? 'Incomplete' : 'Complete' #" },
                                { field: "Action", title: "Action", width: '8%' },
                                { field: "PrincipalPartyID", title: "PrincipalPartyID", hidden: "true" },
                                { field: "PPEntityRoleID", title: "PPEntityRoleID", hidden: "true" },
                                { field: "PersonOrBusinessID", title: "PersonOrBusinessID", hidden: "true" },
                            ]
                            ,
                            selectable: "row",
                            change: function (e) {

                                var selectedRows = this.select();
                                var rowData = this.dataItem(selectedRows[0]);

                                // if (isPrivate == "True") {
                                /* alert(2312);*/
                                renderPrincipalPartyInfo(rowData);
                                // }
                            }
                        });
                    },
                    error: function (xhr) {
                    },
                });
            },
        });
        setTimeout(HideLoader, 500);
    }
    if (id == "Merger Details") {
        ShowLoader();
        $.ajax({
            type: "GET",
            url: "/Process/MergerDetails",
            data: { "WorkitemTypeID": workItemTypeID, "WorkitemID": workItemID },
            success: function (data) {
                previewMergerDetails();
                $("#mergerDetailsPartialView").html(data);

                $.ajax({
                    type: "GET",
                    url: "/Process/MergerGridData?applicationId=" + applicationId,
                    dataType: "json",
                    success: function (results) {
                        $("#mergerGrid").empty();
                        $("#mergerGrid").kendoGrid({
                            toolbar: ["excel"],
                            excel: {
                                fileName: "Merger.xlsx",
                                allPages: true,
                            },
                            dataSource: {
                                data: results.Data,
                                schema: {
                                    model: {
                                        fields: {
                                            LicenseId: { type: "number" },
                                            ApplicationSubType: { type: "string" },
                                            ApplicationStatus: { type: "string" },
                                            LicExpirationDate: { type: "string" },
                                            EntityName: { type: "string" }
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
                            filterable: true,
                            columnMenu: {
                                componentType: "modern",
                                columns: {
                                    sort: "asc",
                                }
                            },
                            columns: [
                                { field: "LicenseId", title: "License #", width: '15%' },
                                { field: "EntityName", title: "License Entity Name", width: '15%' },
                                { field: "ApplicationSubType", title: "License Type", width: '40%' },
                                { field: "ApplicationStatus", title: "License Status", width: '10%' },
                                { field: "LicExpirationDate", title: "Expiration Date", width: '15%', template: "#= LicExpirationDate == null ? 'N/A' : kendo.toString(kendo.parseDate(LicExpirationDate, 'MM/dd/yyyy'),'MM/dd/yyyy') #" },
                            ]
                        });
                    },
                    error: function (xhr) {
                    },
                });
            },
        });
        setTimeout(HideLoader, 500);
    }
    if (id == "Temporary Event Approval") {

        ShowLoader();
        $.ajax({
            type: "GET",
            url: "/Process/TemporaryEventNotification",
            data: { "WorkitemTypeID": workItemTypeID, "WorkitemID": workItemID },
            success: function (data) {
                previewTENDetails();
                $("#temporaryEventNotificationPartialView").html(data);
            },
        });
        setTimeout(HideLoader, 500);
    }
    if (id == "Event Details") {//Added by Pedram 11/18/2021

        ShowLoader();
        $.ajax({
            type: "GET",
            url: "/Process/TemporaryEventInformation",
            data: { "WorkitemTypeID": workItemTypeID, "WorkitemID": workItemID },
            success: function (data) {
                previewTENDetails();
                $("#temporaryEventNotificationPartialView").html(data);
            },
        });
        setTimeout(HideLoader, 500);
    }
    if (id == "Refund Request") {
        ShowLoader();
        $.ajax({
            type: "GET",
            url: "/Process/RefundRequestDetails",
            data: { "WorkitemTypeID": workItemTypeID, "WorkitemID": workItemID },
            success: function (data) {
                hideAllPartialViews('refundRequestPartialView');
                $("#refundRequestPartialView").html(data);
            },
        });
        setTimeout(HideLoader, 500);
    }
    if (id == "Release Bond") {
        ShowLoader();
        $.ajax({
            type: "GET",
            url: "/Process/RequestReleaseBond",
            data: { "WorkitemTypeID": workItemTypeID, "WorkitemID": workItemID },
            success: function (data) {
                previewRequestReleaseBond();
                $("#requestReleaseBondPartialView").html(data);
                var workitemID = $("#hdnWorkItemID").val();
                var WorkItemType = $("#hdnWorkItemType").val();
                $.ajax({
                    type: "GET",
                    url: "/Process/GetRequestReleaseBondGridData?WorkItemID=" + workitemID + "&WorkItemTypeID=" + workItemTypeID,
                    dataType: "json",
                    success: function (results) {
                        $("#ReleaseBondGrid").empty();
                        $("#ReleaseBondGrid").kendoGrid({
                            toolbar: ["excel"],
                            excel: {
                                fileName: "ReleaseBond.xlsx",
                                allPages: true,
                            },
                            dataSource: {
                                data: results,
                                schema: {
                                    model: {
                                        fields: {
                                            LicenseId: { type: "string" },
                                            BondRecordID: { type: "string" },
                                            BondNumber: { type: "string" },
                                            FulfillmentType: { type: "string" },
                                            BondType: { type: "string" },
                                            BondAmount: { type: "string" },
                                            BondStatus: { type: "string" },
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
                                { field: "LicenseId", title: "License Number", width: 100 },
                                { field: "BondRecordID", hidden: "true" },
                                { field: "BondNumber", title: "Bond Number", width: 100 },
                                { field: "FulfillmentType", title: "Fulfillment Type", width: 200 },
                                { field: "BondType", title: "Bond Category", width: 200 },
                                { field: "BondAmount", title: "Amount", width: 100 },
                                { field: "BondStatus", title: "Status", width: 100 },
                            ]
                        });
                    },
                    error: function (xhr) {
                    },
                });

            },
        });
        setTimeout(HideLoader, 500);
    }
    if (id == "Create Inspection" && workItemType == "ACR") {
        ShowLoader();
        $.ajax({
            type: "GET",
            url: "/Process/CreateInspection",
            data: { "WorkitemTypeID": workItemTypeID, "WorkitemID": workItemID },
            success: function (data) {
                previewCreateInspection();
                $("#CreateInspectionPartialView").html(data);
            },
        });
        setTimeout(HideLoader, 500);
    }
    if (id == "Amended Report") {
        viewAmendmentReportData(workItemType, workItemID, workItemTypeID);
    }
    if (id == "Amended Summary") {
        viewAmendmentSummaryData(workItemType, workItemID, workItemTypeID);
    }
    if (workItemType == "INS" && id == "Notes") {
        previewInspectionNotes(applicationId);
    }
    if (workItemType == "INS" && id == "Narrative") {
        previewInspectionNarrative(applicationId);
    }

}

function renderPrincipalPartyInfo(rowData) {
    //alert(rowData.PrincipalPartyID);
    //alert(rowData.PersonOrBusinessID);
    PrincipalPartyID = rowData.PrincipalPartyID;
    $('#principalGridview').hide();
    $('#principalInformation').show();
    $('#secondDiv').show();
    $('#principalpartyID').val(rowData.PrincipalPartyID);
    $('#personOrBusinessID').val(rowData.PersonOrBusinessID);
    //backdiv('#secondDiv');
    $('#principalbasicinfoLink').addClass('current');
    bindprincipalbasicinfodataForUpdatePrincipalAmmendment();
    oneEventRunning = false;
    $("#dvPrincipalParties").hide();
    previewChangeOfPrincipalParties();

}

function bindprincipalbasicinfodataForUpdatePrincipalAmmendment() {

    if (oneEventRunning == false) {
        oneEventRunning = true;
        _masterID = 0;//document.getElementById('MasterID').value;
        var applicationId = $("#hdnApplicationId").val();

        _applicationId = applicationId;
        _principalpartyID = PrincipalPartyID;//document.getElementById('principalpartyID').value;
        // showloadingmsg();
        $.ajax({
            type: "GET",
            url: "/Licensing/GetPrincipalPartyInformationForUpdatePrincipalAmmendment",
            data: { "MasterID": _masterID, "PPID": _principalpartyID, "ApplicationID": _applicationId },
            success: function (data) {
                $("#principalbasicinfoSection").show();
                $("#principalbasicinfoSection").html(data);
                $("#principalbasicinfoSection").removeClass('hidden');
                // hideloadingmsg();
                oneEventRunning = false;
            },
        });
    }
}

function backdiv(id) {

    $('#firstDiv').hide();
    $('#secondDiv').hide();
    oneEventRunning = false;
    $(id).show();
    hideloadingmsg();
    if (id === '#firstDiv') {
        $("#dvPrincipalParties").show();
        HideDivSections();
        $('#dvEntityInfo').hide();
    }
    else {
        $('#dvEntityInfo').show();
    }
}

function HideDivSections() {
    //$('#principalbasicinfoSection').addClass('hidden');
    //$('#principalpersonalinfoSection').addClass('hidden');
    //$('#principalcharacteristicsinfoSection').addClass('hidden');
    //$('#principalspousepageSection').addClass('hidden');
    //$('#principalspoucefelonyinfoSection').addClass('hidden');
    //$('#principalFelonyinfoSection').addClass('hidden');
    //$('#principalresidentpageSection').addClass('hidden');
    //$('#principalresidentialhistorySection').addClass('hidden');
    //$('#principalemployeehistorySection').addClass('hidden');
    //$('#principalCancelinfoSection').addClass('hidden');

    //$('#sectiondivs > div.datasections').addClass('hidden');
}

function showloadingmsg() {
    HideDivSections();
    if ($('#loadingdiv').html() == undefined) {
        $('#sectiondivs').append('<div id="loadingdiv">Data is loading !!!</div >');
    }
}
function hideloadingmsg() {
    $('#loadingdiv').remove();
}

function showloading() {
    HideSections();
    if ($('#loading').html() == undefined) {
        /*$('#sectiondiv').append('<div id="loading"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAMAAACahl6sAAAAV1BMVEX////X19qNjJGysrS+vsDLys2lpaeamZ7m5ufq6uvn5+jZ2tzy8vLg4OHd3d62trjFxcf19fXS0tOrqq3IyMifnqLW1ta0s7aTkpafn6DPztG7ur3AwMDW/gfMAAAKbklEQVR4nO2dbXvyLAyG7bS19E1bXbfp/v/vfKxOLXAFQtfQ3c/h9dVucpYkBAi4WkkrT3aHU52Lf4+wjtnn26Cv738apVi/PfR+Wro106Wyt5E+k6XbM1X54U3Ttly6RRO1fzO0XrpF06S2Jshbv3SbJimxON42S7dpkizLenvLlm7TJJ1tkPdq6UZN0YcN8lks3agpWgOQPza8qz7p+pPPTKaAtFVRRDO/7vy+HZTt3YYSDlLVZXJRk0dh2W8fypxJRyhImycP5e3Mrba1247VOZ4MBGnrZCRxZ9psdaX0o4EgGoc4SfllgGSKfDYMRCWGZP3kY2tqTz4bBFKVJkgjAvCj+t0C+aqph4NAcpNDtktOFsd2e6YeDgGxDEvYS1IAQkauEJD6L4CsCX8PAEEdkpA2O4MgCBWC+SBtg0Ake6SDIBlOVfggsENEQZQ5jNyEJ35skApyyA4k5sB+0zuci7NBQOgVdpFLdMFdApdHuCC4Q3rhDBh3CQzBXBAUeqU7ZLUqMnaXMEGwpwunWisqcKEQzAPBoTeRn9wXawiS2abAA8Ed0shPrFY97hI7BLNA7Kz3KnpyMKN2mMRKu1kgS4Teuxo7l4f+zgFZYix8ag9BrBDMAcGeHqdDhv0bCHIwDJsBgj29jLayheZXWysE+0FabFjxliPVAYJkur/7QQrIESP03lXiLtFDsBeE8PQooffRSAiiZ8E7G2SrNXKZJEtXg7Pgj/EzGxvka9wjSyVZuo7YuMZdcrRBDqOPW9whsTceauzv4xBc2yDj1by/0SFkCD6OHjmYHJ8j+yey3lk9ve5Oadd5nK7F/r4bPdJ/GiDjqEaMhb7Qq1SeK158rjeH7KqNe1e8gynX1/iVGu6eje0fZ4vuDmnVT65cMwww/cG4ojg9D896xx3ZaiT6thAEcVuBGlmjNybss7EOR8dMLYddonfj8VH98LnTvxuCuF60qvvxo549rT4ztHbYF8yCjVeVXwu2Prdn8/+g9MTx1loL3DkZzg8mSJbtyP5GKZe98dP235uj/aoBCJ31tgWYSLq672RzXOxrQ8GDEMyuNgGJFunpKnRtuPpAIIOrEN9hz3r5ZXLWwF4TVl/hFCBJaC+pgWX9uAreBElMf9/Bx6CsgQS/rBbn+m7bSimOIRRDVzFSLrAoxCbBHNiqPKboBLnYFzDKViPJXNvutrR3DcOpoqzKA5K4QAb7Ap3ZPSfwdHwjpNyNIp3DC6JIH7mjgPJKla4HT8k2E4pIWzVUnzQ16o6WSI85IKuNB4RwlUuWWU7eFq8qGH1cznGTa25fekEyX03QPPJZ1SBnO3YMEiIUzyg7HwnskIuRrBkk2Vm0vOKRrLvlmYL1LJIDSJ7mEseqLnmZ18Bzv8MPOvr+z2QOr5Nf7YrzIk+sThE6e8DiaJgz++LoG08G65JZEKQzq6dVBdQJcuxLxLiIZe2xAssdS28gXkv4u3c051rVU1XncZWDxMDoiVjNpO8s9m5XkRgX3a4+uR64drpKbBDOYhapzuEqEsO7w7R+GSVVStmXSPwlk6zi99tYinAVkdM5xCbWTMXy3RmByJyXQrb1K+fQ1IJQLHRcyh5IwkcO5/83XeUgtdVn5igzOIeu/HvMsZbbstRI5rOqkZJnKMaLXDPpOVuf16qeqvrvwVfWe9EJ4nVtpUnKhrszNUkqr+OcG2pXEesfXnrppZdeeul/p7xL0yOh6ydp10Wt0buqKnKPlJ5n1N9rjjbCSZYuWCXgnHZVHQtjUBqvLoyosAO6T1mqlM2xXtMnWmcWb1X+p1NuJKcAjrX8dtVNRIEdoevGeb4LAtnFqZ7kbL6NNFh8WIdE6hLiWAmpYca6CQQhDxnPKe+qvKGyWqmPQJB1jBgcaFnDgqoK5Vg7bkeYTezQ+wQpgkFiXMkUFLMGFRN6JIa3T+mRsOh7ib8xljcYe6K6Lo3aB4KI7bCPFRq1hnqOMhAkTuIYaFvXxJyX+d4VKdkK65JbgU1+DuA4x5qUBJH8NKrmD+7neAeH+P5ePl5ucWRyoPpMMXETea0UIj9tdj5tTnHPcV2XzJvSqaa27hWrKuVRZIqXXnrppZdeeklYbd733cTCwqDvUXmhCnyKYQZVzXFzk2zu2OblPasVQanTzVOCKynjpFegGEV1G01iSylGDR11pm+ihtOdhoT6xJqE9HNeNNvsTYyLZLZ80MnXueyrSAGGUJfg2njWIQufVA8xLqFrhn9uiZqo/7q2qiot53hIYspIL2f97qrsx8iBJDGYONYbfhGK1cmBsRGpa3QunEys1Kw6J0Zs0xrUTxlVato5bhJZO/XuVIVmLbnLOW4SGduJ2viprlL4rErKRVir8GxXqex8JFaHXAIMZ1+aV2Ze+63qor1UJs9ahedkLQkHY0PdZjGDeKvwXsPmeMfFriSLhPwn2RkkJQcjFd5caFkozkYohpvvI2wuVBz7clk3lek+9S19M/IdxR+HHS+08gasDqygtEVT9mU9yf3bPK9rfL7Cb1/0K1UeDHgzSp7+qA9GeV6JgJJ0700D9PfV4c5RdXeO9JgGes+4KAtOAit36jURBFbLjjgGBZEY6wxw2c/pKjRITmOc8F/1qa6AwGyul+B79FyhmAap0GrJ1TmIV10bHKn3N6GessyGeAn0jTWO78Lj+p76HUN1MkH4xtXankw1jLAv1ywLOgldSt5YHCl7kQi8Z/olwFudnEHS7hLCOa7/3u6Q9GS+pkrleQ5+LgyN3Y6m5fZv+DhzeWV4iTMfSWyO1Kg5f/qquTKFIqvr3kwza/HdN63Gy4rfzpv3csShg4wjkzGHgEOEc+dFcxX/jLd65luecxYd4tBMy6gL1xihA3te8zMUs1a2VXPaf+9PvozDCr2Ws1vnDcbNxPmtL+ipS2pW5/wF1NYP3AJPN8KvFZjGH/6FC7GvKiGHNiDaY/L4U+LHCGIf0VWQI/W889z98RJdAkNvqs3lfUMe9hLv1cXzCodePUEBtqN9vvg9/isre390iPYQANFrhnE2GGkufRMOval3yNOj6/IXrqMk6yIjSfaCLO/vjNDLAiFCcLTTjkToNU2CAUKU9sbqEnN+++PpppMyQJb9JRUi9FqZKweEOG4Yxd9bHHrtu2U5IEv+wgIr9LJBiC2qCF3CC718kMVCMBF6wRfzQIgQTC3czCbC05EpMEHAutAg4XrDFodea+0kAGSZEMwNvSEgRMol2yXc0BsCQvi76MSESE5wiGGDECFYMnDhMYRoHh8Ed4mkbYHFXhx6B/FB8KxXctMVgBzJauYAEBiCJUFA0DqS6+8BIDAES5pWBUBCfjueBEFZsGj8tcdDekMkBAT4u+y6kG1bjh3JILO3nhZOG/ujblghTXOCmP4u/fOOxoqWa6ctDMQMweJTKzUmcf7kSCCIVjw3SxG5R21zn1qhwpSRQkGehQ4hV9z/Rup68VXjq1wNBrneYlo35uVfi2sCyN/UC+SvCaS0/yYImGXE+J0iAfHLZv64rNw86u2IM8pcHon3c+Vzy5hl/MP3eGgbOf8wx+gAscxV9jFV3UqUxTH+A5QHvKyZXhXNAAAAAElFTkSuQmCC" /></div >')*/
        $('#sectiondiv').append('<div id="loading">Data is loading !!!</div >');
    }
}
function hideloading() {
    $('#loading').remove();
}

function HideSections() {
    
    document.getElementById('basicInformationSection').classList.add('hidden');
    /* document.getElementById('addressInformationSection').classList.add('hidden');*/
    document.getElementById('contactInformationSection').classList.add('hidden');
    document.getElementById('principalInformationSection').classList.add('hidden');
    document.getElementById('viewHistoryInformationSection').classList.add('hidden');
    /*document.getElementById('changeBasicInformationSection').classList.add('hidden');*/
    /* document.getElementById('principalpersonalinfoSection').classList.add('hidden');*/
    /*$(linkName).removeClass('hidden');*/
}

function CallForData(_btn, _url, _divtoshowdata) {
    var PersonID = $("#personOrBusinessID").val();

    // $(_btn).on('click', function () {
    // $(document).on('click', _btn, function () {
    oneEventRunning = true;
    showloading();
    $.ajax({
        type: "GET",
        url: "/Licensing/" + _url,
        data: { "PersonID": PersonID },
        success: function (data) {
            //HideSections();
            $(_divtoshowdata).show();
            $(_divtoshowdata).html(data);
            $(_divtoshowdata).removeClass('hidden');
            hideloading();
        },
    });

    // })
}

//$(function () {
//    
//    //LoadBasicInformation(document.getElementById('MasterID').value);

//    //$("#basicInformationLink").on('click', function () {
//    //    MasterID = document.getElementById('MasterID').value;
//    //    LoadBasicInformation(MasterID);
//    //});

//    CallForData("#principalInformationLink", "EntityPrincipalPartyInformation", "#principalInformationSection")

//});
function getPaymentWriteoffThreshold() {
    $.ajax({
        type: "GET",
        url: "/ExciseTax/GetSetting?name=PaymentWriteoffThreshold",
        async: false,
        success: function (data) {
            if (data != null) {
                paymentWriteoffThreshold = data.Value;
            } else {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "No record was found." }, "warning");
            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show(
                { message: "Something went Wrong. Please try again." },
                "error"
            );
        },
    });
}

function viewAmendmentSummaryData(workItemType, workItemID, workItemTypeID) {
    getPaymentWriteoffThreshold();
    var selectedLicenseTypeId = $("#hdnLicenseTypeID").val();
    $.ajax({
        type: "GET",
        url: "/Process/GetExciseTaxAmendSummaryAndTax?LicenseType=" + selectedLicenseTypeId,
        success: function (data) {
            hideAllPartialViews('exciseTaxEmendedSummaryPartialView');
            $("#exciseTaxEmendedSummaryPartialView").html(data);
            processAmendSchedules();
        },
    });
}

function processAmendSchedules() {

    AllTypesAfterTax = []; //
    DFAmountAfterTax = [];
    var selectedLicenseTypeId = $("#hdnLicenseTypeID").val();
    var selectedLicenseId = $("#hdnLicenseID").val();
    var reportMonth = $("#hdnReportMonth").val();
    var reportYear = $("#hdnReportYear").val();
    var applicationId = $("#hdnApplicationId").val();

    if (selectedLicenseTypeId == 5) {

        document
            .getElementById("etAmendGrandTotal")
            .classList.add("hidden");
        document
            .getElementById("exciseTaxAmendTotalNonDollar")
            .classList.remove("hidden");
        //document.getElementById("header").classList.add("hidden");
        document.getElementById("amount1").classList.add("hidden");
        document.getElementById("amount2").classList.add("hidden");
        document.getElementById("amount3").classList.add("hidden");
        //document.getElementById("submitNRB").classList.remove("hidden");
        //document.getElementById("submitNRS").classList.add("hidden");
        //document.getElementById("carrierSubmitProcess").classList.add("hidden");
        //document.getElementById("warehouseSubmitProcess").classList.add("hidden");

        exciseTaxNRBAmendData();

    }
    else if (selectedLicenseTypeId == 6) {

        document
            .getElementById("etAmendGrandTotal")
            .classList.add("hidden");
        document
            .getElementById("exciseTaxAmendTotalNonDollar")
            .classList.remove("hidden");
        //document.getElementById("header").classList.add("hidden");
        document.getElementById("amount1").classList.add("hidden");
        document.getElementById("amount2").classList.add("hidden");
        document.getElementById("amount3").classList.add("hidden");
        //document.getElementById("submitNRB").classList.add("hidden");
        //document.getElementById("submitNRS").classList.remove("hidden");
        //document.getElementById("carrierSubmitProcess").classList.add("hidden");
        //document.getElementById("warehouseSubmitProcess").classList.add("hidden");

        exciseTaxNRSAmendData();

    }
    else if (selectedLicenseTypeId == 24) {
        document
            .getElementById("etAmendGrandTotal")
            .classList.add("hidden");
        document
            .getElementById("exciseTaxAmendTotalNonDollar")
            .classList.remove("hidden");
        //document.getElementById("header").classList.add("hidden");
        document.getElementById("amount1").classList.add("hidden");
        document.getElementById("amount2").classList.add("hidden");
        document.getElementById("amount3").classList.add("hidden");
        //document.getElementById("submitNRB").classList.add("hidden");
        //document.getElementById("submitNRS").classList.add("hidden");
        //document.getElementById("carrierSubmitProcess").classList.add("hidden");
        //document.getElementById("warehouseSubmitProcess").classList.remove("hidden");
        exciseTaxCarrierJDAmendGrandTotals();
    }
    else if (selectedLicenseTypeId == 26) {
        document
            .getElementById("etAmendGrandTotal")
            .classList.add("hidden");
        document
            .getElementById("exciseTaxAmendTotalNonDollar")
            .classList.remove("hidden");
        //document.getElementById("header").classList.add("hidden");
        document.getElementById("amount1").classList.add("hidden");
        document.getElementById("amount2").classList.add("hidden");
        document.getElementById("amount3").classList.add("hidden");
        //document.getElementById("submitNRB").classList.add("hidden");
        //document.getElementById("submitNRS").classList.add("hidden");
        //document.getElementById("carrierSubmitProcess").classList.remove("hidden");
        //document.getElementById("warehouseSubmitProcess").classList.add("hidden");
        exciseTaxCarrierJDAmendGrandTotals();
    }
    else {
        $.ajax({
            type: "GET",
            url:
                "/ExciseTax/ProcessAmendReport?LicenseId=" +
                selectedLicenseId +
                "&LicenseTypeId=" +
                selectedLicenseTypeId +
                " &month=" +
                reportMonth +
                " &year=" +
                reportYear +
                " &applicationId=" +
                applicationId,
            success: function (data) {
                var totals = [];
                var scheduleTotal = 0;
                taxedTotalAmount = 0;
                CreditAmount = 0;
                SpiritsCreditAmount = 0;
                MaltCreditAmount = 0;
                WineCreditAmount = 0;
                SpiritsAmountAfterTax = 0;
                WineAmountAfterTax = 0;
                MaltAmountAfterTax = 0;
                DFAmountFinalDue = [];
                var historyCredit = 0;
                DFDeductCredit = [];
                amountDifference = 0;


                if (data.GrandTotals != null) {
                    taxedTotalAmount = data.GrandTotals[0].TaxTotal;
                    historyCredit = data.GrandTotals[0].TaxCredits;

                    //CreditAmount = data.GrandTotals[1].TaxCredits;
                    if (data.GrandTotals.length > 1) {
                        CreditAmount = data.GrandTotals[1].TaxCredits;
                    }
                }


                if (data.SubjectToTax.LicenseTypeId == 1 || data.SubjectToTax.LicenseTypeId == 29 || data.SubjectToTax.LicenseTypeId == 7 || data.SubjectToTax.LicenseTypeId == 32 || data.SubjectToTax.LicenseTypeId == 5 || data.SubjectToTax.LicenseTypeId == 10 || data.SubjectToTax.LicenseTypeId == 12) {
                    if (data.SubjectToTax.ReportedMalt != 0) {
                        scheduleTotal = (data.SubjectToTax.ReportedMalt * data.TaxRate.Malt);
                        totals.push({ Name: "Malt", ReportedTotal: data.SubjectToTax.ReportedMalt, TaxRate: data.TaxRate.Malt, ScheduleTotal: scheduleTotal });
                        /*
                        if (scheduleTotal > 0) {
                            AllTypesAfterTax.push({ Name: "Malt", MaltAmountAfterTax: scheduleTotal });//LEVY-188
                            if ((data.GrandTotals[1].MaltTaxNet - data.GrandTotals[0].MaltTaxNet) > 0) {
                                MaltAmountAfterTax += data.GrandTotals[1].MaltTaxNet - data.GrandTotals[0].MaltTaxNet;
                                DFAmountAfterTax.push({ Name: "Malt", MaltAmountAfterTax: (data.GrandTotals[1].MaltTaxNet - data.GrandTotals[0].MaltTaxNet) });//LEVY-188
                            }
                        }
                        */
                    } else {
                        totals.push({ Name: "Malt", ReportedTotal: 0, TaxRate: 0, ScheduleTotal: 0 });
                    }
                }

                if (data.SubjectToTax.LicenseTypeId == 3 || data.SubjectToTax.LicenseTypeId == 4 || data.SubjectToTax.LicenseTypeId == 6) {
                    if (data.SubjectToTax.ReportedOOSHighWine != 0) {
                        scheduleTotal = (data.SubjectToTax.ReportedOOSHighWine * data.TaxRate.OOSHighWine);
                        totals.push({ Name: "Out-Of-State High Wine", ReportedTotal: data.SubjectToTax.ReportedOOSHighWine, TaxRate: data.TaxRate.OOSHighWine, ScheduleTotal: scheduleTotal });
                        /*
                        if (scheduleTotal > 0) {
                            if (DFAmountAfterTax.some(x => x.Name == 'Wine')) {
                                AllTypesAfterTax.filter(x => x.Name == 'Wine').forEach(x => x.WineAmountAfterTax += scheduleTotal);
                                if ((data.GrandTotals[1].OOSHWTaxNet - data.GrandTotals[0].OOSHWTaxNet) > 0) {
                                    WineAmountAfterTax += data.GrandTotals[1].OOSHWTaxNet - data.GrandTotals[0].OOSHWTaxNet;
                                    DFAmountAfterTax.filter(x => x.Name == 'Wine').forEach(x => x.WineAmountAfterTax += (data.GrandTotals[1].OOSHWTaxNet - data.GrandTotals[0].OOSHWTaxNet));//LEVY-188
                                }
                            } else {
                                AllTypesAfterTax.push({ Name: "Wine", WineAmountAfterTax: scheduleTotal });//LEVY-188
                                if ((data.GrandTotals[1].OOSHWTaxNet - data.GrandTotals[0].OOSHWTaxNet) > 0) {
                                    WineAmountAfterTax += data.GrandTotals[1].OOSHWTaxNet - data.GrandTotals[0].OOSHWTaxNet;
                                    DFAmountAfterTax.push({ Name: "Wine", WineAmountAfterTax: (data.GrandTotals[1].OOSHWTaxNet - data.GrandTotals[0].OOSHWTaxNet) });//LEVY-188
                                }
                            }                            
                        } */
                    } else {
                        totals.push({ Name: "Out-Of-State High Wine", ReportedTotal: 0, TaxRate: 0, ScheduleTotal: 0 });
                    }
                }

                if (data.SubjectToTax.LicenseTypeId == 3 || data.SubjectToTax.LicenseTypeId == 4 || data.SubjectToTax.LicenseTypeId == 6) {
                    if (data.SubjectToTax.ReportedOOSLowWine != 0) {
                        scheduleTotal = (data.SubjectToTax.ReportedOOSLowWine * data.TaxRate.OOSLowWine);
                        totals.push({ Name: "Out-Of-State Low Wine", ReportedTotal: data.SubjectToTax.ReportedOOSLowWine, TaxRate: data.TaxRate.OOSLowWine, ScheduleTotal: scheduleTotal });
                        /*
                        if (scheduleTotal > 0) {
                            if (DFAmountAfterTax.some(x => x.Name == 'Wine')) {
                                AllTypesAfterTax.filter(x => x.Name == 'Wine').forEach(x => x.WineAmountAfterTax += scheduleTotal);
                                if ((data.GrandTotals[1].OOSLWTaxNet - data.GrandTotals[0].OOSLWTaxNet) > 0) {
                                    WineAmountAfterTax += data.GrandTotals[1].OOSLWTaxNet - data.GrandTotals[0].OOSLWTaxNet;
                                    DFAmountAfterTax.filter(x => x.Name == 'Wine').forEach(x => x.WineAmountAfterTax += (data.GrandTotals[1].OOSLWTaxNet - data.GrandTotals[0].OOSLWTaxNet));//LEVY-188
                                }
                            } else {
                                AllTypesAfterTax.push({ Name: "Wine", WineAmountAfterTax: scheduleTotal });//LEVY-188
                                if ((data.GrandTotals[1].OOSLWTaxNet - data.GrandTotals[0].OOSLWTaxNet) > 0) {
                                    WineAmountAfterTax += data.GrandTotals[1].OOSLWTaxNet - data.GrandTotals[0].OOSLWTaxNet;
                                    DFAmountAfterTax.push({ Name: "Wine", WineAmountAfterTax: (data.GrandTotals[1].OOSLWTaxNet - data.GrandTotals[0].OOSLWTaxNet) });//LEVY-188
                                }
                            }  
                        } */
                    } else {
                        totals.push({ Name: "Out-Of-State Low Wine", ReportedTotal: 0, TaxRate: 0, ScheduleTotal: 0 });
                    }
                }

                if (data.SubjectToTax.LicenseTypeId == 3 || data.SubjectToTax.LicenseTypeId == 4 || data.SubjectToTax.LicenseTypeId == 6) {
                    if (data.SubjectToTax.ReportedOOSSparklingWine != 0) {
                        scheduleTotal = (data.SubjectToTax.ReportedOOSSparklingWine * data.TaxRate.OOSSparklingWine);
                        totals.push({ Name: "Out-Of-State Sparkling Wine", ReportedTotal: data.SubjectToTax.ReportedOOSSparklingWine, TaxRate: data.TaxRate.OOSSparklingWine, ScheduleTotal: scheduleTotal });
                        /*
                        if (scheduleTotal > 0) {
                            if (DFAmountAfterTax.some(x => x.Name == 'Wine')) {
                                AllTypesAfterTax.filter(x => x.Name == 'Wine').forEach(x => x.WineAmountAfterTax += scheduleTotal);
                                if ((data.GrandTotals[1].OOSSWTaxNet - data.GrandTotals[0].OOSSWTaxNet) > 0) {
                                    WineAmountAfterTax += data.GrandTotals[1].OOSSWTaxNet - data.GrandTotals[0].OOSSWTaxNet;
                                    DFAmountAfterTax.filter(x => x.Name == 'Wine').forEach(x => x.WineAmountAfterTax += (data.GrandTotals[1].OOSSWTaxNet - data.GrandTotals[0].OOSSWTaxNet));//LEVY-188
                                }
                            } else {
                                AllTypesAfterTax.push({ Name: "Wine", WineAmountAfterTax: scheduleTotal });//LEVY-188
                                if ((data.GrandTotals[1].OOSSWTaxNet - data.GrandTotals[0].OOSSWTaxNet) > 0) {
                                    WineAmountAfterTax += data.GrandTotals[1].OOSSWTaxNet - data.GrandTotals[0].OOSSWTaxNet;
                                    DFAmountAfterTax.push({ Name: "Wine", WineAmountAfterTax: (data.GrandTotals[1].OOSSWTaxNet - data.GrandTotals[0].OOSSWTaxNet) });//LEVY-188
                                }
                            }  
                        } */
                    } else {
                        totals.push({ Name: "Out-Of-State Sparkling Wine", ReportedTotal: 0, TaxRate: 0, ScheduleTotal: 0 });
                    }
                }

                /*if (data.SubjectToTax.LicenseTypeId == 2 || data.SubjectToTax.LicenseTypeId == 8 || data.SubjectToTax.LicenseTypeId == 6) {
                    if (data.SubjectToTax.ReportedSpirits != 0) {
                        scheduleTotal = (data.SubjectToTax.ReportedSpirits * data.TaxRate.Spirits);
                        totals.push({ Name: "Spirits", ReportedTotal: data.SubjectToTax.ReportedSpirits, TaxRate: data.TaxRate.Spirits, ScheduleTotal: scheduleTotal });
                        if (scheduleTotal > 0) {
                            if (DFAmountAfterTax.some(x => x.Name == 'Spirits')) {
                                AllTypesAfterTax.push({ Name: "Spirits", SpiritsAmountAfterTax: scheduleTotal });//LEVY-188
                                if ((data.GrandTotals[1].SpiritTaxNet - data.GrandTotals[0].SpiritTaxNet) > 0) {
                                    DFAmountAfterTax.filter(x => x.Name == 'Spirits').forEach(x => x.SpiritsAmountAfterTax += (data.GrandTotals[1].SpiritTaxNet - data.GrandTotals[0].SpiritTaxNet));//LEVY-188
                                }
                            } else {
                                if ((data.GrandTotals[1].SpiritTaxNet - data.GrandTotals[0].SpiritTaxNet) > 0) {
                                    DFAmountAfterTax.push({ Name: "Spirits", SpiritsAmountAfterTax: (data.GrandTotals[1].SpiritTaxNet - data.GrandTotals[0].SpiritTaxNet) });//LEVY-188
                                }
                            }
                        }
                    } else {
                        totals.push({ Name: "Spirits", ReportedTotal: 0, TaxRate: 0, ScheduleTotal: 0 });
                    }
                }*/

                if (data.SubjectToTax.LicenseTypeId == 3 || data.SubjectToTax.LicenseTypeId == 8 || data.SubjectToTax.LicenseTypeId == 9) {
                    if (data.SubjectToTax.ReportedTexasHighWine != 0) {
                        scheduleTotal = (data.SubjectToTax.ReportedTexasHighWine * data.TaxRate.TexasHighWine);
                        totals.push({ Name: "In-State High Wine", ReportedTotal: data.SubjectToTax.ReportedTexasHighWine, TaxRate: data.TaxRate.TexasHighWine, ScheduleTotal: scheduleTotal });
                        /*
                        if (scheduleTotal > 0) {
                            if (DFAmountAfterTax.some(x => x.Name == 'Wine')) {
                                AllTypesAfterTax.filter(x => x.Name == 'Wine').forEach(x => x.WineAmountAfterTax += scheduleTotal);
                                if ((data.GrandTotals[1].TXHWTaxNet - data.GrandTotals[0].TXHWTaxNet) > 0) {
                                    WineAmountAfterTax += data.GrandTotals[1].TXHWTaxNet - data.GrandTotals[0].TXHWTaxNet;
                                    DFAmountAfterTax.filter(x => x.Name == 'Wine').forEach(x => x.WineAmountAfterTax += (data.GrandTotals[1].TXHWTaxNet - data.GrandTotals[0].TXHWTaxNet));//LEVY-188
                                }
                            } else {
                                AllTypesAfterTax.push({ Name: "Wine", WineAmountAfterTax: scheduleTotal });//LEVY-188
                                if ((data.GrandTotals[1].TXHWTaxNet - data.GrandTotals[0].TXHWTaxNet) > 0) {
                                    WineAmountAfterTax += data.GrandTotals[1].TXHWTaxNet - data.GrandTotals[0].TXHWTaxNet;
                                    DFAmountAfterTax.push({ Name: "Wine", WineAmountAfterTax: (data.GrandTotals[1].TXHWTaxNet - data.GrandTotals[0].TXHWTaxNet) });//LEVY-188
                                }
                            }  
                        } */
                    } else {
                        totals.push({ Name: "In-State High Wine", ReportedTotal: 0, TaxRate: 0, ScheduleTotal: 0 });
                    }
                }

                if (data.SubjectToTax.LicenseTypeId == 3 || data.SubjectToTax.LicenseTypeId == 8 || data.SubjectToTax.LicenseTypeId == 9) {
                    if (data.SubjectToTax.ReportedTexasLowWine != 0) {
                        scheduleTotal = (data.SubjectToTax.ReportedTexasLowWine * data.TaxRate.TexasLowWine);
                        totals.push({ Name: "In-State Low Wine", ReportedTotal: data.SubjectToTax.ReportedTexasLowWine, TaxRate: data.TaxRate.TexasLowWine, ScheduleTotal: scheduleTotal });
                        /* if (scheduleTotal > 0) {
                            if (DFAmountAfterTax.some(x => x.Name == 'Wine')) {
                                AllTypesAfterTax.filter(x => x.Name == 'Wine').forEach(x => x.WineAmountAfterTax += scheduleTotal);
                                if ((data.GrandTotals[1].TXLWTaxNet - data.GrandTotals[0].TXLWTaxNet) > 0) {
                                    WineAmountAfterTax += data.GrandTotals[1].TXLWTaxNet - data.GrandTotals[0].TXLWTaxNet;
                                    DFAmountAfterTax.filter(x => x.Name == 'Wine').forEach(x => x.WineAmountAfterTax += (data.GrandTotals[1].TXLWTaxNet - data.GrandTotals[0].TXLWTaxNet));//LEVY-188
                                }
                            } else {
                                AllTypesAfterTax.push({ Name: "Wine", WineAmountAfterTax: scheduleTotal });//LEVY-188
                                if ((data.GrandTotals[1].TXLWTaxNet - data.GrandTotals[0].TXLWTaxNet) > 0) {
                                    WineAmountAfterTax += data.GrandTotals[1].TXLWTaxNet - data.GrandTotals[0].TXLWTaxNet;
                                    DFAmountAfterTax.push({ Name: "Wine", WineAmountAfterTax: (data.GrandTotals[1].TXLWTaxNet - data.GrandTotals[0].TXLWTaxNet) });//LEVY-188
                                }
                            }  
                        } */
                    } else {
                        totals.push({ Name: "In-State Low Wine", ReportedTotal: 0, TaxRate: 0, ScheduleTotal: 0 });
                    }
                }

                if (data.SubjectToTax.LicenseTypeId == 3 || data.SubjectToTax.LicenseTypeId == 8 || data.SubjectToTax.LicenseTypeId == 9) {
                    if (data.SubjectToTax.ReportedTexasSparklingWine != 0) {
                        scheduleTotal = (data.SubjectToTax.ReportedTexasSparklingWine * data.TaxRate.TexasSparklingWine);
                        totals.push({ Name: "In-State Sparkling Wine", ReportedTotal: data.SubjectToTax.ReportedTexasSparklingWine, TaxRate: data.TaxRate.TexasSparklingWine, ScheduleTotal: scheduleTotal });
                        /* if (scheduleTotal > 0) {
                            if (DFAmountAfterTax.some(x => x.Name == 'Wine')) {
                                AllTypesAfterTax.filter(x => x.Name == 'Wine').forEach(x => x.WineAmountAfterTax += scheduleTotal);
                                if ((data.GrandTotals[1].TXSWTaxNet - data.GrandTotals[0].TXSWTaxNet) > 0) {
                                    WineAmountAfterTax += data.GrandTotals[1].TXSWTaxNet - data.GrandTotals[0].TXSWTaxNet;
                                    DFAmountAfterTax.filter(x => x.Name == 'Wine').forEach(x => x.WineAmountAfterTax += (data.GrandTotals[1].TXSWTaxNet - data.GrandTotals[0].TXSWTaxNet));//LEVY-188
                                }
                            } else {
                                AllTypesAfterTax.push({ Name: "Wine", WineAmountAfterTax: scheduleTotal });//LEVY-188
                                if ((data.GrandTotals[1].TXSWTaxNet - data.GrandTotals[0].TXSWTaxNet) > 0) {
                                    WineAmountAfterTax += data.GrandTotals[1].TXSWTaxNet - data.GrandTotals[0].TXSWTaxNet;
                                    DFAmountAfterTax.push({ Name: "Wine", WineAmountAfterTax: (data.GrandTotals[1].TXSWTaxNet - data.GrandTotals[0].TXSWTaxNet) });//LEVY-188
                                }
                            }  
                        } */
                    } else {
                        totals.push({ Name: "In-State Sparkling Wine", ReportedTotal: 0, TaxRate: 0, ScheduleTotal: 0 });
                    }
                }

                if (data.SubjectToTax.LicenseTypeId == 2 || data.SubjectToTax.LicenseTypeId == 8 || data.SubjectToTax.LicenseTypeId == 6) {
                    if (data.SubjectToTax.ReportedSpirits != 0) {
                        scheduleTotal = (data.SubjectToTax.ReportedSpirits * data.TaxRate.Spirits);
                        totals.push({ Name: "Spirits", ReportedTotal: data.SubjectToTax.ReportedSpirits, TaxRate: data.TaxRate.Spirits, ScheduleTotal: scheduleTotal });
                        /* if (scheduleTotal > 0) {
                            if (DFAmountAfterTax.some(x => x.Name == 'Spirits')) {
                                AllTypesAfterTax.push({ Name: "Spirits", SpiritsAmountAfterTax: scheduleTotal });//LEVY-188
                                if ((data.GrandTotals[1].SpiritTaxNet - data.GrandTotals[0].SpiritTaxNet) > 0) {
                                    SpiritsAmountAfterTax += data.GrandTotals[1].SpiritTaxNet - data.GrandTotals[0].SpiritTaxNet;
                                    DFAmountAfterTax.filter(x => x.Name == 'Spirits').forEach(x => x.SpiritsAmountAfterTax += (data.GrandTotals[1].SpiritTaxNet - data.GrandTotals[0].SpiritTaxNet));//LEVY-188
                                }
                            } else {
                                if ((data.GrandTotals[1].SpiritTaxNet - data.GrandTotals[0].SpiritTaxNet) > 0) {
                                    SpiritsAmountAfterTax += data.GrandTotals[1].SpiritTaxNet - data.GrandTotals[0].SpiritTaxNet;
                                    DFAmountAfterTax.push({ Name: "Spirits", SpiritsAmountAfterTax: (data.GrandTotals[1].SpiritTaxNet - data.GrandTotals[0].SpiritTaxNet) });//LEVY-188
                                }
                            }
                        } */
                    } else {
                        totals.push({ Name: "Spirits", ReportedTotal: 0, TaxRate: 0, ScheduleTotal: 0 });
                    }
                }

                if (data.SubjectToTax.LicenseTypeId == 2 || data.SubjectToTax.LicenseTypeId == 8 || data.SubjectToTax.LicenseTypeId == 6) {
                    if (data.SubjectToTax.ReportedUnits != 0) {
                        scheduleTotal = (data.SubjectToTax.ReportedUnits * data.TaxRate.Units);
                        totals.push({ Name: "Units", ReportedTotal: data.SubjectToTax.ReportedUnits, TaxRate: data.TaxRate.Units, ScheduleTotal: scheduleTotal });
                        /* if (scheduleTotal > 0) {
                            if (DFAmountAfterTax.some(x => x.Name == 'Spirits')) {
                                AllTypesAfterTax.filter(x => x.Name == 'Spirits').forEach(x => x.UnitAmountAfterTax += scheduleTotal);
                                if ((data.GrandTotals[1].UnitsTaxNet - data.GrandTotals[0].UnitsTaxNet) > 0) {
                                    SpiritsAmountAfterTax += data.GrandTotals[1].UnitsTaxNet - data.GrandTotals[0].UnitsTaxNet;
                                    DFAmountAfterTax.filter(x => x.Name == 'Spirits').forEach(x => x.UnitAmountAfterTax += (data.GrandTotals[1].UnitsTaxNet - data.GrandTotals[0].UnitsTaxNet));
                                }
                            } else {
                                AllTypesAfterTax.push({ Name: "Spirits", UnitAmountAfterTax: scheduleTotal });
                                if ((data.GrandTotals[1].UnitsTaxNet - data.GrandTotals[0].UnitsTaxNet) > 0) {
                                    SpiritsAmountAfterTax += data.GrandTotals[1].UnitsTaxNet - data.GrandTotals[0].UnitsTaxNet;
                                    DFAmountAfterTax.push({ Name: "Spirits", UnitAmountAfterTax: (data.GrandTotals[1].UnitsTaxNet - data.GrandTotals[0].UnitsTaxNet) });
                                }
                            }
                        } */
                    } else {
                        totals.push({ Name: "Units", ReportedTotal: 0, TaxRate: 0, ScheduleTotal: 0 });
                    }
                }

                /*if (data.SubjectToTax.LicenseTypeId == 2 || data.SubjectToTax.LicenseTypeId == 8 || data.SubjectToTax.LicenseTypeId == 6) {
                    if (data.SubjectToTax.ReportedUnits != 0) {
                        scheduleTotal = (data.SubjectToTax.ReportedUnits * data.TaxRate.Units);
                        totals.push({ Name: "Units", ReportedTotal: data.SubjectToTax.ReportedUnits, TaxRate: data.TaxRate.Units, ScheduleTotal: scheduleTotal });
                    } else {
                        totals.push({ Name: "Units", ReportedTotal: 0, TaxRate: 0, ScheduleTotal: 0 });
                    }
                }*/

                if (data.SubjectToTax.LicenseTypeId == 1 || data.SubjectToTax.LicenseTypeId == 29 || data.SubjectToTax.LicenseTypeId == 7 || data.SubjectToTax.LicenseTypeId == 32 || data.SubjectToTax.LicenseTypeId == 5 || data.SubjectToTax.LicenseTypeId == 10 || data.SubjectToTax.LicenseTypeId == 12) {
                    MaltAmountAfterTax = data.TaxRate.Malt * data.GrandTotals[1].ReportedMALTTotal - data.TaxRate.Malt * data.GrandTotals[0].ReportedMALTTotal;
                }

                if (data.SubjectToTax.LicenseTypeId == 3 || data.SubjectToTax.LicenseTypeId == 4 || data.SubjectToTax.LicenseTypeId == 6 || data.SubjectToTax.LicenseTypeId == 8 || data.SubjectToTax.LicenseTypeId == 9) {
                    WineAmountAfterTax =

                        (data.TaxRate.OOSHighWine * data.GrandTotals[1].ReportedOOSHWTotal
                            + data.TaxRate.OOSLowWine * data.GrandTotals[1].ReportedOOSLWTotal
                            + data.TaxRate.OOSSparklingWine * data.GrandTotals[1].ReportedOOSSWTotal
                            + data.TaxRate.TexasHighWine * data.GrandTotals[1].ReportedTXHWTotal
                            + data.TaxRate.TexasLowWine * data.GrandTotals[1].ReportedTXLWTotal
                            + data.TaxRate.TexasSparklingWine * data.GrandTotals[1].ReportedTXSWTotal) -
                        (data.TaxRate.OOSHighWine * data.GrandTotals[0].ReportedOOSHWTotal
                            + data.TaxRate.OOSLowWine * data.GrandTotals[0].ReportedOOSLWTotal
                            + data.TaxRate.OOSSparklingWine * data.GrandTotals[0].ReportedOOSSWTotal
                            + data.TaxRate.TexasHighWine * data.GrandTotals[0].ReportedTXHWTotal
                            + data.TaxRate.TexasLowWine * data.GrandTotals[0].ReportedTXLWTotal
                            + data.TaxRate.TexasSparklingWine * data.GrandTotals[0].ReportedTXSWTotal);

                    if (WineAmountAfterTax < 0) {
                        WineAmountAfterTax = WineAmountAfterTax + historyCredit;
                    }
                }


                if (data.SubjectToTax.LicenseTypeId == 2 || data.SubjectToTax.LicenseTypeId == 8 || data.SubjectToTax.LicenseTypeId == 6) {
                    SpiritsAmountAfterTax = (data.TaxRate.Spirits * data.GrandTotals[1].ReportedSPIRITSTotal + data.TaxRate.Units * data.GrandTotals[1].ReportedUNITSTotal)
                        - (data.TaxRate.Spirits * data.GrandTotals[0].ReportedSPIRITSTotal + data.TaxRate.Units * data.GrandTotals[0].ReportedUNITSTotal);
                }

                const maxNegative = Math.min(SpiritsAmountAfterTax, WineAmountAfterTax, MaltAmountAfterTax);

                if (maxNegative < 0) {
                    if (maxNegative === SpiritsAmountAfterTax) {
                        WineAmountAfterTax = SpiritsAmountAfterTax + WineAmountAfterTax;
                    } else if (maxNegative === WineAmountAfterTax) {
                        SpiritsAmountAfterTax = WineAmountAfterTax + SpiritsAmountAfterTax;
                    }
                }

                /*
                MaltCreditAmount = MaltAmountAfterTax && taxedTotalAmount > 0 ? (CreditAmount * MaltAmountAfterTax / taxedTotalAmount) : 0;
                SpiritsCreditAmount = SpiritsAmountAfterTax && taxedTotalAmount > 0 ? (CreditAmount * SpiritsAmountAfterTax / taxedTotalAmount) : 0;
                WineCreditAmount = WineAmountAfterTax && taxedTotalAmount ? (CreditAmount * WineAmountAfterTax / taxedTotalAmount) : 0;
                */

                MaltCreditAmount = MaltAmountAfterTax > 0 ? (MaltAmountAfterTax * CreditAmount) / (MaltAmountAfterTax + SpiritsAmountAfterTax + WineAmountAfterTax) : 0;
                SpiritsCreditAmount = SpiritsAmountAfterTax > 0 ? (SpiritsAmountAfterTax * CreditAmount) / (MaltAmountAfterTax + SpiritsAmountAfterTax + WineAmountAfterTax) : 0;
                WineCreditAmount = WineAmountAfterTax ? (WineAmountAfterTax * CreditAmount) / (MaltAmountAfterTax + SpiritsAmountAfterTax + WineAmountAfterTax) : 0;


                DFAmountFinalDue.push({ Name: "Spirits", SpiritsAmountDue: SpiritsAmountAfterTax - SpiritsCreditAmount });
                DFAmountFinalDue.push({ Name: "Wine", WineAmountDue: WineAmountAfterTax - WineCreditAmount });
                DFAmountFinalDue.push({ Name: "Malt", MaltAmountDue: MaltAmountAfterTax - MaltCreditAmount });

                //Credit Duction
                DFDeductCredit.push({ DeductAmount: CreditAmount });

                if (data.SubjectToTax.LicenseTypeId == 5 || data.SubjectToTax.LicenseTypeId == 6 || data.SubjectToTax.LicenseTypeId == 24 || data.SubjectToTax.LicenseTypeId == 26
                    || data.SubjectToTax.LicenseTypeId == 29 || data.SubjectToTax.LicenseTypeId == 12) {
                    document.getElementById("showSummary").classList.remove("hidden");
                }
                else {
                    document.getElementById("showTax").classList.remove("hidden");
                }

                if (totals.length > 0) {
                    $("#etTaxTotalsRow").empty();
                    $("#etTaxTotalsRow").kendoGrid({
                        dataSource: {
                            data: totals,
                            schema: {
                                model: {
                                    fields: {
                                        Name: { type: "string" },
                                        ReportedTotal: { type: "number" },
                                        TaxRate: { type: "decimal" },
                                        ScheduleTotal: { type: "decimal" }
                                    },
                                },
                            },
                            pageSize: 10,
                        },
                        scrollable: false,
                        columns: [
                            { field: "Name", title: "Name" },
                            {
                                field: "ReportedTotal", title: "Reported Total",
                                attributes: { "class": "text-right" },
                            },
                            { field: "TaxRate", title: "Tax Rate", width: 180, format: "{0:n4}", attributes: { "class": "text-right" } },
                            { field: "ScheduleTotal", title: "Total", width: 200, format: "{0:n4}", attributes: { "class": "text-right" } }
                        ],
                    });

                    $("#etTaxTotalsRow tbody tr").slice(-1).addClass("font-weight-light");
                    $("#etTaxTotalsRow thead th").slice(1).addClass("text-right");

                    if (data.GrandTotals.length > 0) {
                        var results = data.GrandTotals;
                        if (results[1] != null) {
                            document.getElementById("exc_DollarTotal").innerHTML =
                                customFormatter.format(results[0].TaxTotal);
                            document.getElementById("exc_DollarDiscount").innerHTML =
                                customFormatter.format(results[0].TaxDiscount);
                            //ASR-182
                            document.getElementById("exc_CreditBalanceApplied").innerHTML =
                                customFormatter.format(CreditAmount);
                            document.getElementById("exc_DollarNetTotal").innerHTML =
                                customFormatter.format(results[0].TaxNet);

                            document.getElementById("exc_CurrentDollarTotal").innerHTML =
                                customFormatter.format(results[1].TaxTotal);
                            document.getElementById("exc_CurrentDollarDiscount").innerHTML =
                                customFormatter.format(results[1].TaxDiscount);
                            document.getElementById("exc_CurrentDollarNetTotal").innerHTML =
                                customFormatter.format(results[1].TaxNet);

                            if (results[1].TaxNet <= 0) {
                                //amountDifference = results[0].TaxNet + results[1].TaxTotal - results[1].TaxDiscount - CreditAmount;
                                amountDifference = results[0].TaxNet + CreditAmount - (results[1].TaxTotal - results[1].TaxDiscount);
                            }
                            else {
                                if (results[0].TaxDiscount > 0) {
                                    amountDifference = results[0].TaxNet - results[1].TaxNet;
                                }
                                else {
                                    amountDifference = results[0].TaxTotal - results[1].TaxNet;
                                }

                            }
                            document.getElementById("exc_DifferenceDollarNetTotal").innerHTML =
                                customFormatter.format(amountDifference);

                            if (amountDifference.toFixed(2) < 0) {
                                document.getElementById("exc_DifferenceDollarNetTotal").style.color = "red";
                                document.getElementById("exc_DifferenceDollarNetTotal").style.fontWeight = "bold";
                                document.getElementById("btnMDemandFunds").classList.remove("hidden");
                                document.getElementById("btnMWriteOff").classList.add("hidden");
                                //document.getElementById("btnMZeroSubmit").classList.add("hidden");
                                document.getElementById("btnMIssueCredit").classList.add("hidden");
                                document.getElementById("btnIssueRefund").classList.add("hidden");
                                if (Math.abs(amountDifference.toFixed(2)) <= paymentWriteoffThreshold) {
                                    document.getElementById("btnMWriteOff").classList.remove("hidden");
                                    document.getElementById("btnMZeroSubmit").classList.add("hidden");
                                    document.getElementById("btnMDemandFunds").classList.add("hidden");
                                    document.getElementById("btnMIssueCredit").classList.add("hidden");
                                    document.getElementById("btnIssueRefund").classList.add("hidden");
                                }
                            } else if (amountDifference.toFixed(2) > 0) {
                                document.getElementById("exc_DifferenceDollarNetTotal").style.font = "bold";
                                document.getElementById("btnMIssueCredit").classList.remove("hidden");
                                document.getElementById("btnIssueRefund").classList.remove("hidden");
                                document.getElementById("btnMDemandFunds").classList.add("hidden");
                                document.getElementById("btnMWriteOff").classList.add("hidden");
                                //document.getElementById("btnMZeroSubmit").classList.add("hidden");
                            } else if (amountDifference.toFixed(2) == 0) {
                                //document.getElementById("btnattestformnext").classList.add("hidden");
                                document.getElementById("btnMIssueCredit").classList.add("hidden");
                                document.getElementById("btnIssueRefund").classList.add("hidden");
                                document.getElementById("btnMDemandFunds").classList.add("hidden");
                                document.getElementById("btnMWriteOff").classList.add("hidden");
                                document.getElementById("btnMZeroSubmit").classList.remove("hidden");
                            }
                        }
                        else {
                            document.getElementById("exc_DollarTotal").innerHTML =
                                customFormatter.format(results[0].TaxTotal);
                            document.getElementById("exc_DollarDiscount").innerHTML =
                                customFormatter.format(results[0].TaxDiscount);
                            document.getElementById("exc_DollarNetTotal").innerHTML =
                                customFormatter.format(results[0].TaxNet);

                            document.getElementById("exc_CurrentDollarTotal").innerHTML =
                                customFormatter.format(results[0].TaxTotal);
                            document.getElementById("exc_CurrentDollarDiscount").innerHTML =
                                customFormatter.format(results[0].TaxDiscount);
                            document.getElementById("exc_CurrentDollarNetTotal").innerHTML =
                                customFormatter.format(results[0].TaxNet);

                            amountDifference = results[0].TaxNet - results[0].TaxNet;
                            document.getElementById("exc_DifferenceDollarNetTotal").innerHTML =
                                customFormatter.format(results[0].TaxNet - results[0].TaxNet);

                            document.getElementById("btnMZeroSubmit").classList.remove("hidden");
                        }
                    }

                    //======================================================

                } else {
                    var popupNotification = $("#Notification").data("kendoNotification");
                    popupNotification.show({ message: "No totals are found." }, "warning");
                }

            },

            error: function (xhr) {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show(
                    { message: "Something went Wrong. Please try again." },
                    "error"
                );
            },
        });
    }
}

function processDeductCredit() {
    if (DFDeductCredit != null && DFDeductCredit.length > 0) {
        var workItemID = $("#hdnWorkItemID").val();
        var selectedLicenseId = $("#hdnLicenseID").val();
        var reportMonth = $("#hdnReportMonth").val();
        var reportYear = $("#hdnReportYear").val();

        var requestDC = new Object();
        requestDC.LicenseId = selectedLicenseId;
        requestDC.ReportedYear = reportYear;
        requestDC.ReportedMonth = reportMonth;
        requestDC.WorkItemID = workItemID;
        requestDC.DeductAmount = DFDeductCredit[0].DeductAmount;

        if (requestDC.DeductAmount > 0) {
            $.ajax({
                type: "POST",
                url: "/ExciseTax/DeductCredit",
                contentType: "application/json",
                data: JSON.stringify(requestDC),
                success: function (data) {
                    if (data == "True") {
                        var popupNotification = $("#Notification").data("kendoNotification");
                        popupNotification.show(
                            { message: "Credit deduction processed successfully." },
                            "success"
                        );
                    }
                },
                error: function (xhr) {
                    var popupNotification = $("#Notification").data("kendoNotification");
                    popupNotification.show(
                        { message: "Something went Wrong. Please try again." },
                        "error"
                    );
                },
            });
        }
    }
}

function modifiedIssueCredit() {
    var workItemID = $("#hdnWorkItemID").val();
    var selectedLicenseId = $("#hdnLicenseID").val();
    var reportMonth = $("#hdnReportMonth").val();
    var reportYear = $("#hdnReportYear").val();

    var request = new Object();
    request.LicenseId = selectedLicenseId;
    request.ReportedYear = reportYear;
    request.ReportedMonth = reportMonth;
    request.Amount = amountDifference;
    request.WorkItemID = workItemID;

    document.getElementById("btnMIssueCredit").disabled = true;

    $.ajax({
        type: "POST",
        url: "/ExciseTax/IssueCredit",
        contentType: "application/json",
        data: JSON.stringify(request),
        success: function (data) {
            if (data == "True") {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show(
                    { message: "Request processed successfully." },
                    "success"
                );
                window.location = "/PrivateUser/PrivateUserDashboard#";
            } else {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show(
                    { message: "Something went Wrong. Please try again." },
                    "warning"
                );

                document.getElementById("btnMIssueCredit").disabled = false;

            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show(
                { message: "Something went Wrong. Please try again." },
                "error"
            );

            document.getElementById("btnMIssueCredit").disabled = false;

        },
    });
}

function etIssueRefund() {
    var workItemID = $("#hdnWorkItemID").val();
    var selectedLicenseId = $("#hdnLicenseID").val();
    var reportMonth = $("#hdnReportMonth").val();
    var reportYear = $("#hdnReportYear").val();

    var request = new Object();
    request.LicenseId = selectedLicenseId;
    request.ReportedYear = reportYear;
    request.ReportedMonth = reportMonth;
    request.Amount = amountDifference;
    request.WorkItemID = workItemID;

    document.getElementById("btnIssueRefund").disabled = true;


    $.ajax({
        type: "POST",
        url: "/ExciseTax/etIssueRefund",
        contentType: "application/json",
        data: JSON.stringify(request),
        success: function (data) {
            if (data == "True") {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "Request processed successfully." }, "success");
                window.location = "/PrivateUser/PrivateUserDashboard#";
            } else {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "Something went Wrong. Please try again." }, "warning");

                document.getElementById("btnIssueRefund").disabled = false;

            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");

            document.getElementById("btnIssueRefund").disabled = false;

        },
    });
}

function modifiedDemandFunds() {

    var workItemID = $("#hdnWorkItemID").val();
    var selectedLicenseId = $("#hdnLicenseID").val();
    var reportMonth = $("#hdnReportMonth").val();
    var reportYear = $("#hdnReportYear").val();
    var deductCounter = 0;

    //LEVY-188
    for (var i = 0; i < DFAmountFinalDue.length; i++) {
        var USASData = {};
        var request = new Object();
        request.LicenseId = selectedLicenseId;
        request.ReportedYear = reportYear;
        request.ReportedMonth = reportMonth;
        //request.Amount = amountDifference;
        request.WorkItemID = workItemID;

        request.USASCodingData = [];
        if (DFAmountFinalDue[i].Name == "Spirits") {
            USASData.USASTransactionDesc = "Excise Tax Distilled Spirits-Compl.";
            USASData.USASTransactionAmt = DFAmountFinalDue[i].SpiritsAmountDue;
        }

        if (DFAmountFinalDue[i].Name == "Malt") {
            USASData.USASTransactionDesc = "Excise Tax Malt Beverage-Compl.";
            USASData.USASTransactionAmt = DFAmountFinalDue[i].MaltAmountDue;
        }
        if (DFAmountFinalDue[i].Name == "Wine") {
            USASData.USASTransactionDesc = "Excise Tax Wine-Compl";
            USASData.USASTransactionAmt = DFAmountFinalDue[i].WineAmountDue;
        }

        request.Amount = USASData.USASTransactionAmt;
        request.USASCodingData.push(USASData);

        if (request.Amount > 0) {
            deductCounter++;
            if (deductCounter = 1) {
                processDeductCredit();
            }

            document.getElementById("btnMDemandFunds").disabled = true;

            //LEVY-188
            $.ajax({
                type: "POST",
                url: "/ExciseTax/DemandFunds",
                contentType: "application/json",
                data: JSON.stringify(request),
                async: false,//LEVY-188
                success: function (data) {
                    if (data == "True") {
                        var popupNotification = $("#Notification").data("kendoNotification");
                        popupNotification.show(
                            { message: "Request processed successfully." },
                            "success"
                        );
                        window.location = "/PrivateUser/PrivateUserDashboard#";
                    } else {
                        var popupNotification = $("#Notification").data("kendoNotification");
                        popupNotification.show(
                            { message: "Something went Wrong. Please try again." },
                            "warning"
                        );

                        document.getElementById("btnMDemandFunds").disabled = false;
                    }
                },
                error: function (xhr) {
                    var popupNotification = $("#Notification").data("kendoNotification");
                    popupNotification.show(
                        { message: "Something went Wrong. Please try again." },
                        "error"
                    );

                    document.getElementById("btnMDemandFunds").disabled = false;
                },
            });
        }
    }
}

function exciseTaxNRBAmendData() {
    //GetNRBDataForPrivateUser
    var selectedLicenseTypeId = $("#hdnLicenseTypeID").val();
    var selectedLicenseId = $("#hdnLicenseID").val();
    var reportMonth = $("#hdnReportMonth").val();
    var reportYear = $("#hdnReportYear").val();

    $.ajax({
        type: "GET",
        url:
            "/ExciseTax/GetNRBAmendDataForPublicUser?LicenseId=" +
            selectedLicenseId +
            "&month=" +
            reportMonth +
            " &year=" +
            reportYear,
        success: function (results) {
            //document.getElementById("exec_reportedID").innerHTML = results[0].Id;

            if (results.length > 0) {
                var totals = [];
                totals.push({
                    Name: "MALT",
                    ReportedTotals: results[0].ReportedMALT,
                    ModifiedTotals: results[1] != null ? results[1].ReportedMALT : 0,
                });

                totals.push({
                    Name: "No.Packages",
                    ReportedTotals: results[0].PackageCount,
                    ModifiedTotals: results[1] != null ? results[1].PackageCount : 0,
                });

                $("#etTaxTotalsRowNonDollar").empty();
                $("#etTaxTotalsRowNonDollar").kendoGrid({
                    dataSource: {
                        data: totals,
                        schema: {
                            model: {
                                fields: {
                                    Name: { type: "string" },
                                    ReportedTotals: { type: "number" },
                                    ModifiedTotals: { type: "number" },
                                },
                            },
                        },
                        pageSize: 10,
                    },
                    scrollable: false,
                    columns: [
                        { field: "Name", title: "Name" },
                        {
                            field: "ReportedTotals", title: "Reported Totals",
                            attributes: { "class": "text-right" }
                        },
                        {
                            field: "ModifiedTotals", title: "Modified Totals",
                            hidden: results[0] == null,
                            attributes: { "class": "text-right" }
                        }
                    ],
                });

                $("#etTaxTotalsRowNonDollar tbody tr").slice(-1).addClass("font-weight");
                $("#etTaxTotalsRowNonDollar thead th").slice(1).addClass("text-right");
                if (results[0] != null) {
                    $("#etTaxTotalsRowNonDollar thead th").slice(2).addClass("text-right");
                }
                document.getElementById("submitNonDollarAmendment").classList.remove("hidden");
                // SubmitNRSData();


            } else {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "No totals are found." }, "warning");
            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show(
                { message: "Something went Wrong. Please try again." },
                "error"
            );
        },
    });
}

function exciseTaxNRSAmendData() {
    /*var selectedLicenseTypeId = $("#hdnLicenseTypeID").val();*/
    var selectedLicenseId = $("#hdnLicenseID").val();
    var reportMonth = $("#hdnReportMonth").val();
    var reportYear = $("#hdnReportYear").val();

    $.ajax({
        type: "GET",
        url:
            "/ExciseTax/GetNRSAmendDataForPublicUser?LicenseId=" +
            selectedLicenseId +
            "&month=" +
            reportMonth +
            " &year=" +
            reportYear,
        success: function (results) {
            //document.getElementById("exec_reportedID").innerHTML = results[0].Id;

            if (results.length > 0) {
                var totals = [];

                totals.push({
                    Name: "Out-Of-State High Wine",
                    ReportedTotals: results[0].ReportedOOSHW,
                    ModifiedTotals: results[1] != null ? results[1].ReportedOOSHW : 0,
                });
                totals.push({
                    Name: "Out-Of-State Low Wine",
                    ReportedTotals: results[0].ReportedOOSLW,
                    ModifiedTotals: results[1] != null ? results[1].ReportedOOSLW : 0,
                });
                totals.push({
                    Name: "Out-Of- State Sparkling Wine",
                    ReportedTotals: results[0].ReportedOOSSW,
                    ModifiedTotals: results[1] != null ? results[1].ReportedOOSSW : 0,
                });
                totals.push({
                    Name: "Spirits",
                    ReportedTotals: results[0].ReportedSPIRITS,
                    ModifiedTotals: results[1] != null ? results[1].ReportedSPIRITS : 0,
                });

                totals.push({
                    Name: "Units",
                    ReportedTotals: results[0].ReportedUNITS,
                    ModifiedTotals: results[1] != null ? results[1].ReportedUNITS : 0,
                });

                if (totals.every((x) => x.ReportedTotals === 0)) {
                    totals.forEach(function (el) { el.ReportedTotals = el.ModifiedTotals; });
                    totals.forEach(function (el) { el.ModifiedTotals = 0; })
                } //APD-592

                $("#etTaxTotalsRowNonDollar").empty();
                $("#etTaxTotalsRowNonDollar").kendoGrid({
                    dataSource: {
                        data: totals,
                        schema: {
                            model: {
                                fields: {
                                    Name: { type: "string" },
                                    ReportedTotals: { type: "number" },
                                    ModifiedTotals: { type: "number" },
                                },
                            },
                        },
                        pageSize: 10,
                    },
                    scrollable: false,
                    columns: [
                        { field: "Name", title: "Name" },
                        {
                            field: "ReportedTotals", title: "Reported Totals",
                            attributes: { "class": "text-right" }
                        },
                        {
                            field: "ModifiedTotals", title: "Modified Totals",
                            hidden: results[0] == null,
                            attributes: { "class": "text-right" }
                        }
                    ],
                });

                $("#etTaxTotalsRowNonDollar tbody tr").slice(-1).addClass("font-weight");
                $("#etTaxTotalsRowNonDollar thead th").slice(1).addClass("text-right");
                if (results[0] != null) {
                    $("#etTaxTotalsRowNonDollar thead th").slice(2).addClass("text-right");
                }
                document.getElementById("submitNonDollarAmendment").classList.remove("hidden");
                // SubmitNRSData();


            } else {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "No totals are found." }, "warning");
            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show(
                { message: "Something went Wrong. Please try again." },
                "error"
            );
        },
    });
}

function SubmitNonDollarData() {

    var actionId = 39; //Closed
    /* var selectedEmployeeId = $("#FCAssignedTo option:selected").val();*/
    var actionNote = 'Work item Submitted';
    var workItemID = $("#hdnWorkItemID").val();
    var workItemType = $("#hdnWorkItemTypeID").val();

    var applicationId = $("#hdnApplicationId").val();
    var publicUserProfileId = $("#hdPublicUserProfileId").val();
    var workItemTypeID = $("#hdnWorkItemTypeIDs").val();

    var workItemTypeID = $("#hdnWorkItemTypeIDs").val();

    var updateRequest = new Object();
    updateRequest.ActionNotes = actionNote;
    updateRequest.WorkitemType = workItemType;
    updateRequest.WorkitemID = workItemID;
    updateRequest.SelectedActionID = actionId;
    updateRequest.ActionDate = new Date().toLocaleString();
    updateRequest.strActionDate = new Date().toLocaleString();
    updateRequest.ApplicationId = applicationId;
    updateRequest.PublicUserProfileId = publicUserProfileId;
    /* updateRequest.AssignedToEmail = fcassignedTo;*/
    updateRequest.WorkitemTypeId = workItemTypeID;
    //updateRequest.SelectedEmployeeId = selectedEmployeeId;
    //updateRequest.CutOffDate = cutOffDate;
    //updateRequest.ApprovalPRDate = approvalDate;

    document.getElementById("submitNonDollarAmendment").disabled = true;


    $.ajax({
        type: 'POST',
        url: "/Process/SaveFinalize",
        contentType: "application/json",
        data: JSON.stringify(updateRequest),
        success: function (data) {
            var popupNotification = $("#Notification").data("kendoNotification");
            if (data.result == true) {
                popupNotification.show({ message: "Your request has been Submitted successfully." }, "success");
                window.location = "/PrivateUser/PrivateUserDashboard#";
            }
            else {
                popupNotification.show({ message: "Your request is not completed." }, "error");

                document.getElementById("submitNonDollarAmendment").disabled = false;

            }
        },
        error: function (objError) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");

            document.getElementById("submitNonDollarAmendment").disabled = false;

        }
    });

}

function modifiedZeroSubmit() {
    var workItemID = $("#hdnWorkItemID").val();
    var selectedLicenseId = $("#hdnLicenseID").val();
    var reportMonth = $("#hdnReportMonth").val();
    var reportYear = $("#hdnReportYear").val();

    var request = new Object();
    request.LicenseId = selectedLicenseId;
    request.ReportedYear = reportYear;
    request.ReportedMonth = reportMonth;
    request.Amount = 0;
    request.WorkItemID = workItemID;

    document.getElementById("btnMZeroSubmit").disabled = true;


    $.ajax({
        type: "POST",
        url: "/ExciseTax/IssueCredit",
        contentType: "application/json",
        data: JSON.stringify(request),
        success: function (data) {
            if (data == "True") {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show(
                    { message: "Request processed successfully." },
                    "success"
                );
                window.location = "/PrivateUser/PrivateUserDashboard#";
            } else {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show(
                    { message: "Something went Wrong. Please try again." },
                    "warning"
                );

                document.getElementById("btnMZeroSubmit").disabled = false;

            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show(
                { message: "Something went Wrong. Please try again." },
                "error"
            );

            document.getElementById("btnMZeroSubmit").disabled = false;

        },
    });
}

function exciseTaxCarrierJDAmendGrandTotals() {
    //GetAggregatedNonDollarDataForPrivateUser
    var selectedLicenseTypeId = $("#hdnLicenseTypeID").val();
    var selectedLicenseId = $("#hdnLicenseID").val();
    var reportMonth = $("#hdnReportMonth").val();
    var reportYear = $("#hdnReportYear").val();

    $.ajax({
        type: "GET",
        url:
            "/ExciseTax/GetAggregatedNonDollarAmendDataForPublicUser?LicenseId=" +
            selectedLicenseId +
            "&month=" +
            reportMonth +
            " &year=" +
            reportYear,
        success: function (results) {
            //document.getElementById("exec_reportedID").innerHTML = results[0].Id;

            if (results.length > 0) {
                var totals = [];
                if (selectedLicenseTypeId === '26') {
                    totals.push({
                        Name: "Malt",
                        PreviousTotals: (results.some(el => el.CommodityType === 'Malt') === true ? $.grep(results, function (p) { return p.CommodityType == 'Malt'; })
                            .map(function (p) { return p.PreviousNumberOfPackage; }) : 0),
                        CurrentTotals: (results.some(el => el.CommodityType === 'Malt') === true ? $.grep(results, function (p) { return p.CommodityType == 'Malt'; })
                            .map(function (p) { return p.CurrentNumberOfPackage; }) : 0),
                    });
                    totals.push({
                        Name: "Wine",
                        PreviousTotals: (results.some(el => el.CommodityType === 'Wine') === true ? $.grep(results, function (p) { return p.CommodityType == 'Wine'; })
                            .map(function (p) { return p.PreviousNumberOfPackage; }) : 0),
                        CurrentTotals: (results.some(el => el.CommodityType === 'Wine') === true ? $.grep(results, function (p) { return p.CommodityType == 'Wine'; })
                            .map(function (p) { return p.CurrentNumberOfPackage; }) : 0),
                    });
                    totals.push({
                        Name: "Out-Of-State Low Wine",
                        PreviousTotals: (results.some(el => el.CommodityType === 'Out-Of-State Low Wine') === true ? $.grep(results, function (p) { return p.CommodityType == 'Out-Of-State Low Wine'; })
                            .map(function (p) { return p.PreviousNumberOfPackage; }) : 0),
                        CurrentTotals: (results.some(el => el.CommodityType === 'Out-Of-State Low Wine') === true ? $.grep(results, function (p) { return p.CommodityType == 'Out-Of-State Low Wine'; })
                            .map(function (p) { return p.CurrentNumberOfPackage; }) : 0),
                    });
                    totals.push({
                        Name: "Out-Of- State Sparkling Wine",
                        PreviousTotals: (results.some(el => el.CommodityType === 'Out-Of- State Sparkling Wine') === true ? $.grep(results, function (p) { return p.CommodityType == 'Out-Of- State Sparkling Wine'; })
                            .map(function (p) { return p.PreviousNumberOfPackage; }) : 0),
                        CurrentTotals: (results.some(el => el.CommodityType === 'Out-Of- State Sparkling Wine') === true ? $.grep(results, function (p) { return p.CommodityType == 'Out-Of- State Sparkling Wine'; })
                            .map(function (p) { return p.CurrentNumberOfPackage; }) : 0),
                    });
                    totals.push({
                        Name: "Spirits",
                        PreviousTotals: (results.some(el => el.CommodityType === 'Spirit') === true ? $.grep(results, function (p) { return p.CommodityType == 'Spirit'; })
                            .map(function (p) { return p.PreviousNumberOfPackage; }) : 0),
                        CurrentTotals: (results.some(el => el.CommodityType === 'Spirit') === true ? $.grep(results, function (p) { return p.CommodityType == 'Spirit'; })
                            .map(function (p) { return p.CurrentNumberOfPackage; }) : 0),
                    });
                    totals.push({
                        Name: "In-State High Wine",
                        PreviousTotals: (results.some(el => el.CommodityType === 'In-State High Wine",') === true ? $.grep(results, function (p) { return p.CommodityType == 'In-State High Wine",'; })
                            .map(function (p) { return p.PreviousNumberOfPackage; }) : 0),
                        CurrentTotals: (results.some(el => el.CommodityType === 'In-State High Wine",') === true ? $.grep(results, function (p) { return p.CommodityType == 'In-State High Wine",'; })
                            .map(function (p) { return p.CurrentNumberOfPackage; }) : 0),
                    });
                    totals.push({
                        Name: "In-State Low Wine",
                        PreviousTotals: (results.some(el => el.CommodityType === 'In-State Low Wine') === true ? $.grep(results, function (p) { return p.CommodityType == 'In-State Low Wine'; })
                            .map(function (p) { return p.PreviousNumberOfPackage; }) : 0),
                        CurrentTotals: (results.some(el => el.CommodityType === 'In-State Low Wine') === true ? $.grep(results, function (p) { return p.CommodityType == 'In-State Low Wine'; })
                            .map(function (p) { return p.CurrentNumberOfPackage; }) : 0),
                    });
                    totals.push({
                        Name: "In-State Sparkling Wine",
                        PreviousTotals: (results.some(el => el.CommodityType === 'In-State Sparkling Wine"') === true ? $.grep(results, function (p) { return p.CommodityType == 'In-State Sparkling Wine"'; })
                            .map(function (p) { return p.PreviousNumberOfPackage; }) : 0),
                        CurrentTotals: (results.some(el => el.CommodityType === 'In-State Sparkling Wine"') === true ? $.grep(results, function (p) { return p.CommodityType == 'In-State Sparkling Wine"'; })
                            .map(function (p) { return p.CurrentNumberOfPackage; }) : 0),
                    });
                    totals.push({
                        Name: "Units",
                        PreviousTotals: (results.some(el => el.CommodityType === 'Units') === true ? $.grep(results, function (p) { return p.CommodityType == 'Units'; })
                            .map(function (p) { return p.PreviousNumberOfPackage; }) : 0),
                        CurrentTotals: (results.some(el => el.CommodityType === 'Units') === true ? $.grep(results, function (p) { return p.CommodityType == 'Units'; })
                            .map(function (p) { return p.CurrentNumberOfPackage; }) : 0),
                    });
                } else if (selectedLicenseTypeId === '24') {
                    totals.push({
                        Name: "WR Malt",
                        PreviousTotals: (results.some(el => el.CommodityType === 'PreviousMalt') === true ? $.grep(results, function (p) { return p.CommodityType == 'PreviousMalt'; })
                            .map(function (p) { return p.Quantity; }) : 0),
                        CurrentTotals: (results.some(el => el.CommodityType === 'CurrentWRMalt') === true ? $.grep(results, function (p) { return p.CommodityType == 'CurrentWRMalt'; })
                            .map(function (p) { return p.Quantity; }) : 0),
                    });
                    totals.push({
                        Name: "WR Low Wine",
                        PreviousTotals: (results.some(el => el.CommodityType === 'PreviousWRLowWine') === true ? $.grep(results, function (p) { return p.CommodityType == 'PreviousWRLowWine'; })
                            .map(function (p) { return p.Quantity; }) : 0),
                        CurrentTotals: (results.some(el => el.CommodityType === 'CurrentWRLowWine') === true ? $.grep(results, function (p) { return p.CommodityType == 'CurrentWRLowWine'; })
                            .map(function (p) { return p.Quantity; }) : 0),
                    });
                    totals.push({
                        Name: "WR Sparkling Wine",
                        PreviousTotals: (results.some(el => el.CommodityType === 'PreviousWRSparklingWine') === true ? $.grep(results, function (p) { return p.CommodityType == 'PreviousWRSparklingWine'; })
                            .map(function (p) { return p.Quantity; }) : 0),
                        CurrentTotals: (results.some(el => el.CommodityType === 'CurrentWRSparklingWine') === true ? $.grep(results, function (p) { return p.CommodityType == 'CurrentWRSparklingWine'; })
                            .map(function (p) { return p.Quantity; }) : 0),
                    });
                    totals.push({
                        Name: "WR Spirits",
                        PreviousTotals: (results.some(el => el.CommodityType === 'PreviousWRSpirits') === true ? $.grep(results, function (p) { return p.CommodityType == 'PreviousWRSpirits'; })
                            .map(function (p) { return p.Quantity; }) : 0),
                        CurrentTotals: (results.some(el => el.CommodityType === 'CurrentWRSpirits') === true ? $.grep(results, function (p) { return p.CommodityType == 'CurrentWRSpirits'; })
                            .map(function (p) { return p.Quantity; }) : 0),
                    });
                    totals.push({
                        Name: "WR High Wine",
                        PreviousTotals: (results.some(el => el.CommodityType === 'PreviousWRHighWine') === true ? $.grep(results, function (p) { return p.CommodityType == 'PreviousWRHighWine'; })
                            .map(function (p) { return p.Quantity; }) : 0),
                        CurrentTotals: (results.some(el => el.CommodityType === 'CurrentWRHighWine') === true ? $.grep(results, function (p) { return p.CommodityType == 'CurrentWRHighWine'; })
                            .map(function (p) { return p.Quantity; }) : 0),
                    });

                }
                $("#etTaxTotalsRowNonDollar").empty();
                $("#etTaxTotalsRowNonDollar").kendoGrid({
                    dataSource: {
                        data: totals,
                        schema: {
                            model: {
                                fields: {
                                    Name: { type: "string" },
                                    PreviousTotals: { type: "number" },
                                    CurrentTotals: { type: "number" },
                                },
                            },
                        },
                        pageSize: 10,
                    },
                    scrollable: false,
                    columns: [
                        { field: "Name", title: "Name" },
                        {
                            field: "PreviousTotals", title: "Previous Totals",
                            attributes: { "class": "text-right" }
                        },
                        {
                            field: "CurrentTotals", title: "Current Totals",
                            hidden: results[0] == null,
                            attributes: { "class": "text-right" }
                        }
                    ],
                });

                $("#etTaxTotalsRowNonDollar tbody tr").slice(-1).addClass("font-weight-bold");
                $("#etTaxTotalsRowNonDollar thead th").slice(1).addClass("text-right");
                if (results[0] != null) {
                    $("#etTaxTotalsRowNonDollar thead th").slice(2).addClass("text-right");
                }
                document.getElementById("submitNonDollarAmendment").classList.remove("hidden");

            } else {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "No totals are found." }, "warning");
            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show(
                { message: "Something went Wrong. Please try again." },
                "error"
            );
        },
    });
}

function viewAmendmentReportData(workItemType, workItemID, workItemTypeID) {
    var licenseTypeId = 0, applicationId = 0, licenseId = 0;
    clearAllExciseTaxGridDiv();
    ShowLoader();
    $.ajax({
        type: "GET",
        url: "/Process/AmendOpenInventoryRecords",
        data: { "WorkitemTypeID": workItemType, "WorkitemID": workItemID },
        success: function (data) {
            hideAllPartialViews('exciseTaxEmendedReportPartialView');
            $("#exciseTaxEmendedReportPartialView").html(data);
            var workitemID = $("#hdnWorkItemID").val();
            var WorkItemType = $("#hdnWorkItemTypeID").val();
            licenseTypeId = $("#hfLicenseTypeId").val();

            var reportMonth = $("#hdnReportMonth").val();
            var reportYear = $("#hdnReportYear").val();
            var monthName = GetMonthName(reportMonth);
            monthName = '# ' + monthName + ' ' + reportYear + ' - ' + 'Amended Report';
            $("#divHeading").html(monthName);
            if (licenseTypeId !== "6" && licenseTypeId !== "24" && licenseTypeId !== "26" && licenseTypeId !== "4") {
                $.ajax({
                    type: "GET",
                    url: "/Process/GetAmendOpenInventoryRecords?WorkItemID=" + workitemID + "&WorkItemTypeID=" + workItemTypeID + "&PeriodMonth=" + reportMonth + "&PeriodYear=" + reportYear,
                    dataType: "json",
                    success: function (results) {

                        var OpeningInventoryResults = results.Data;
                        applicationId = $("#hdnApplicationId").val();
                        licenseTypeId = $("#hdnLicenseTypeID").val();
                        $("#divOpeningInventoryGrid").empty();
                        $("#divOpeningInventoryGrid").kendoGrid({
                            toolbar: ["excel"],
                            excel: {
                                fileName: "EmendedOpeningInventory.xlsx",
                                allPages: true,
                            },
                            dataSource: {
                                data: OpeningInventoryResults,
                                schema: {
                                    model: {
                                        fields: {
                                            Id: { type: "number" },
                                            LicenseID: { type: "number" },
                                            EffectiveMonth: { type: "number" },
                                            EffectiveYear: { type: "number" },
                                            AlcoholName: { type: "string" },
                                            Quantity: { type: "decimal" },
                                            CreatedBy: { type: "string" },
                                            AlcoholTypeId: { type: "number" }
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
                                { field: "Id", title: "Id", width: 130, hidden: "true" },
                                { field: "LicenseID", title: "License", width: 130 },
                                { field: "EffectiveMonth", title: "Effective Month", width: 130 },
                                { field: "EffectiveYear", title: "Effective Year", width: 130 },
                                { field: "AlcoholTypeId", title: "AlcoholTypeId", width: 130 },
                                { field: "AlcoholName", title: "Alcohol", width: 180 },
                                { field: "Quantity", title: "Opening inventory", width: 200, format: "{0:n4}", },
                            ],
                        });
                        viewallAmendedReportedSchedulesData(applicationId, licenseTypeId);
                        previewAmendClosingInventoryRecords(applicationId);
                    },
                    error: function (xhr) {
                    },
                });
            } else {
                applicationId = $("#hdnApplicationId").val();
                document.getElementById('divOpeningInventoryReadOnly').classList.add('hidden');
                document.getElementById('divEndingInventoryReadOnly').classList.add('hidden');
                viewallAmendedReportedSchedulesData(applicationId, licenseTypeId);
            }
        },
    });
    setTimeout(HideLoader, 500);
}

function viewExistingReportData() {
    var reportMonth = 0, reportYear = 0, licenseId = 0;
    applicationId = $("#hdnApplicationId").val();
    licenseTypeId = $("#hdnLicenseTypeID").val();
    licenseId = $("#hdnLicenseID").val();
    reportMonth = $("#hdnReportMonth").val();
    reportYear = $("#hdnReportYear").val();
    ShowLoader();
    clearAllExciseTaxGridDiv();
    previewWebOpenInventoryRecords(licenseId, reportMonth, reportYear)
    setTimeout(HideLoader, 500);
}

function clearAllExciseTaxGridDiv() {
    $("#divOpeningInventoryGrid").empty();
    $("#reportedSchedule1AmendResult").empty();
    $("#reportedSchedule2AmendResult").empty();
    $("#reportedSchedule3AmendResult").empty();
    $("#reportedSchedule4AmendResult").empty();
    $("#reportedCarrierAmendResult").empty();
    $("#reportedWarehouseAmendResult").empty();
    $("#reportedNonresidentSellerAmendResult").empty();
    $("#reportedNonresidentBrewerAmendResult").empty();
    $("#endingInvResult").empty();
}

function viewOnlyReports(reportedPeriodId, licenseTypeId, selectedLicenseId) {

    $.ajax({
        type: "GET",
        url: "/ExciseTax/GetLicenseReportedPeriodViews?Id=" + reportedPeriodId + "&LicenseTypeId=" + licenseTypeId + "&LicenseId=" + selectedLicenseId,
        dataType: "json",
        contentType: "application/json",
        success: function (results) {

            if (results != null) {

                var schedule1Results = results.Schedule1.Data;
                var schedule2Results = results.Schedule2.Data;
                var schedule3Results = results.Schedule3.Data;
                var schedule4Results = results.Schedule4.Data;

                var carrierResults = results.CarrierReport.Data;
                var warehouseResults = results.WarehouseReport.Data;
                var nRSResults = results.NonResidentSellerReport.Data;
                var nRBResults = results.NonResidentBrewerReport.Data;

                reportMonth = results.ReportedTotal.PeriodMonth;
                reportYear = results.ReportedTotal.PeriodYear;

                checkLicenseType(licenseTypeId);

                SelectedSchedule1Month = reportMonth;
                SelectedSchedule1MYear = reportYear;
                SelectedSchedule2Month = reportMonth;
                SelectedSchedule2Year = reportYear;
                SelectedSchedule3Month = reportMonth;
                SelectedSchedule3Year = reportYear;
                SelectedSchedule4Month = reportMonth;
                SelectedSchedule4Year = reportYear;

                SelectedCarrierMonth = reportMonth;
                SelectedCarrierYear = reportYear;
                SelectedWarehouseMonth = reportMonth;
                SelectedWarehouseYear = reportYear;
                SelectedNonresidentSellerMonth = reportMonth;
                SelectedNonresidentSellerYear = reportYear;
                SelectedNonresidentBrewerMonth = reportMonth;
                SelectedNonresidentBrewerYear = reportYear;
                if (carrierResults.length > 0 || warehouseResults.length > 0 || nRSResults.length > 0) {
                    if (carrierResults.length > 0) {
                        SelectedCarrierMonth = carrierResults[0].EffectiveMonth;
                        SelectedCarrierYear = carrierResults[0].EffectiveYear;

                        $("#reportedCarrierAmendResult").kendoGrid({
                            toolbar: ["excel"],
                            excel: {
                                fileName: "CarrierReport.xlsx",
                                allPages: true,
                            },
                            dataSource: {
                                data: carrierResults,
                                schema: {
                                    model: {
                                        fields: {
                                            CarrierRecordId: { type: "number" },
                                            LicenseId: { type: "number" },
                                            EffectiveMonth: { type: "number" },
                                            EffectiveYear: { type: "number" },
                                            Consignor: { type: "string" },
                                            Consignee: { type: "string" },
                                            PointOfOrigin: { type: "string" },
                                            Destination: { type: "string" },
                                            CommodityType: { type: "string" },
                                            strDeliveryDate: { type: "string" },
                                            FreightBillNumber: { type: "string" },
                                            CommodityTypeId: { type: "number" },
                                            NumberOfPackages: { type: "number" },
                                            strShippedDate: { type: "string" },
                                        },
                                    },
                                },
                                pageSize: 5,
                            },
                            scrollable: false,
                            sortable: true,
                            pageable: true,
                            filterable: {
                                extra: false,
                                operators: {
                                    string: {
                                        startswith: "Starts with",
                                        eq: "Is equal to",
                                        neq: "Is not equal to",
                                    },
                                },
                            },
                            columns: [
                                { field: "CarrierRecordId", title: "Id", width: "5%", hidden: "true" },
                                { field: "ScheduleType", title: "ScheduleType", width: "5%", hidden: "true" },
                                {
                                    field: "LicenseId",
                                    title: "License",
                                    width: "5%",
                                    hidden: "true",
                                },
                                {
                                    field: "Consignor",
                                    title: "Consignor",
                                    width: "5%",
                                    hidden: "true",
                                },
                                { field: "Consignee", title: "Consignee", width: "15%" },
                                { field: "PointOfOrigin", title: "Point Of Origin", width: "15%" },
                                { field: "Destination", title: "Destination", width: "10%" },
                                { field: "CommodityType", title: "Commodity Type", width: "10%" },
                                { field: "NumberOfPackages", title: "No of Packages", width: "5%" }
                            ],
                        });
                    }
                    else if (warehouseResults.length > 0) {
                        SelectedWarehouseMonth = warehouseResults[0].ReportingMonth;
                        SelectedWarehouseYear = warehouseResults[0].ReportingYear;

                        $("#reportedWarehouseAmendResult").kendoGrid({
                            toolbar: ["excel"],
                            excel: {
                                fileName: "WarehouseReport.xlsx",
                                allPages: true,
                            },
                            dataSource: {
                                data: warehouseResults,
                                schema: {
                                    model: {
                                        fields: {
                                            WarehouseRecordId: { type: "number" },
                                            LicenseId: { type: "number" },
                                            ReportingMonth: { type: "number" },
                                            ReportingYear: { type: "number" },
                                            WRPermit: { type: "string" },
                                            WRTransactionTypes: { type: "string" },
                                            ScheduleType: { type: "string" },
                                            WRSpirits: { type: "decimal" },
                                            WRLowWine: { type: "decimal" },
                                            WRHighWine: { type: "decimal" },
                                            WRSparklingWine: { type: "decimal" },
                                            WRMalt: { type: "decimal" },
                                            WRTransactionTypeId: { type: "number" },
                                        },
                                    },
                                },
                                pageSize: 5,
                            },
                            scrollable: false,
                            sortable: true,
                            pageable: true,
                            filterable: {
                                extra: false,
                                operators: {
                                    string: {
                                        startswith: "Starts with",
                                        eq: "Is equal to",
                                        neq: "Is not equal to",
                                    },
                                },
                            },
                            columns: [
                                { field: "WarehouseRecordId", title: "WarehouseRecordId", width: "5%", hidden: "true" },
                                { field: "LicenseId", title: "License", width: "5%", hidden: "true" },
                                { field: "ScheduleType", title: "ScheduleType", width: "5%", hidden: "true" },
                                { field: "WRPermit", title: "Permit", width: "10%" },
                                { field: "WRSpirits", title: "Spirits", width: "10%", format: "{0:n4}" },
                                { field: "WRLowWine", title: "WRLowWine", width: "20%", format: "{0:n4}" },
                                { field: "WRHighWine", title: "WRHighWine", width: "20%", format: "{0:n4}" },
                                { field: "WRSparklingWine", title: "WRSparklingWine", width: "20%", format: "{0:n4}" },
                                { field: "WRMalt", title: "WRMalt", width: "20%", format: "{0:n4}" },
                                {
                                    field: "WRTransactionTypes",
                                    title: "Transaction"
                                }
                            ],
                        });
                    }
                    else if (nRSResults.length > 0) {
                        reportingMonthNRS = nRSResults[0].ReportingMonth;
                        reportingYearNRS = nRSResults[0].ReportingYear;
                        SelectedNonresidentSellerMonth = nRSResults[0].ReportingMonth;
                        SelectedNonresidentSellerYear = nRSResults[0].ReportingYear;

                        $("#reportedNonresidentSellerAmendResult").kendoGrid({
                            toolbar: ["excel"],
                            excel: {
                                fileName: "NonresidentSellerReport.xlsx",
                                allPages: true,
                            },
                            dataSource: {
                                data: nRSResults,
                                schema: {
                                    model: {
                                        fields: {
                                            NRSRecordID: { type: "string" },
                                            LicenseID: { type: "string" },
                                            TransactionType: { type: "string" },
                                            InvoiceNumber: { type: "string" },
                                            strInvoiceDate: { type: "string" },
                                            AlcoholType: { type: "string" },
                                            Permit: { type: "string" },
                                            ScheduleType: { type: "string" },
                                            TransactionId: { type: "number" },
                                            AlcoholTypeId: { type: "number" },
                                            InvoiceDate: { type: "string" },
                                        },
                                    },
                                },
                                pageSize: 5,
                            },
                            scrollable: false,
                            sortable: true,
                            pageable: true,
                            filterable: {
                                extra: false,
                                operators: {
                                    string: {
                                        startswith: "Starts with",
                                        eq: "Is equal to",
                                        neq: "Is not equal to",
                                    },
                                },
                            },
                            columns: [
                                { field: "NRSRecordID", title: "NRSRecordID", width: "5%", hidden: "true" },
                                {
                                    field: "LicenseID",
                                    title: "License",
                                    width: "5%",
                                    hidden: "true",
                                },
                                {
                                    field: "ScheduleType",
                                    title: "ScheduleType",
                                    width: "5%",
                                    hidden: "true",
                                },
                                { field: "Permit", title: "Permit", width: "20%" },
                                { field: "TransactionType", title: "Transaction Type", width: "15%" },
                                { field: "AlcoholType", title: "Alcohol Type", width: "15%" },
                                { field: "Quantity", title: "Quantity", width: "15%" },
                                // { field: "InvoiceDate", title: "Invoice Date", width: "15%" },
                                { field: "strInvoiceDate", title: "Invoice Date", width: "15%" },
                                { field: "InvoiceNumber", title: "Invoice Number", width: "15%" },
                                { field: "AlcoholTypeId", title: "AlcoholTypeId", width: "5%", hidden: "true" },
                                { field: "TransactionId", title: "TransactionId", width: "5%", hidden: "true" }
                            ],
                        });
                    }
                    else if (nRBResults.length > 0) {
                        reportingMonthNBR = nRBResults[0].EffectiveMonth;
                        reportingYearNBR = nRBResults[0].EffectiveYear;
                        SelectedNonresidentBrewerMonth = nRBResults[0].ReportingMonth;
                        SelectedNonresidentBrewerYear = nRBResults[0].ReportingYear;

                        $("#reportedNonresidentBrewerAmendResult").kendoGrid({
                            toolbar: ["excel"],
                            excel: {
                                fileName: "NonresidentBrewerReport.xlsx",
                                allPages: true,
                            },
                            dataSource: {
                                data: nRBResults,
                                schema: {
                                    model: {
                                        fields: {
                                            NRBRecordID: { type: "string" },
                                            LicenseID: { type: "string" },
                                            Permit: { type: "string" },
                                            TransactionType: { type: "string" },
                                            ScheduleType: { type: "string" },
                                            TransactionTypeId: { type: "number" }
                                        },
                                    },
                                },
                                pageSize: 5,
                            },
                            scrollable: false,
                            sortable: true,
                            pageable: true,
                            filterable: {
                                extra: false,
                                operators: {
                                    string: {
                                        startswith: "Starts with",
                                        eq: "Is equal to",
                                        neq: "Is not equal to",
                                    },
                                },
                            },
                            columns: [
                                { field: "NRBRecordID", title: "NRBRecordID", width: "5%", hidden: "true" },
                                {
                                    field: "LicenseID",
                                    title: "License",
                                    width: "5%",
                                    hidden: "true",
                                },
                                {
                                    field: "ScheduleType",
                                    title: "ScheduleType",
                                    width: "5%",
                                    hidden: "true",
                                },
                                { field: "Permit", title: "Permit", width: "20%" },
                                { field: "TransactionType", title: "Transaction Type", width: "15%" },
                                { field: "AlcoholType", title: "Alcohol Type", width: "15%" },
                                { field: "Quantity", title: "Quantity", width: "15%" },
                                { field: "InvoiceDate", title: "Invoice Date", width: "15%" },
                                { field: "InvoiceNumber", title: "Invoice Number", width: "15%" }
                            ],
                        });
                    }
                }
                else {
                    if (schedule1Results.length > 0) {
                        SelectedSchedule1Month = schedule1Results[0].EffectiveMonth;
                        SelectedSchedule1Year = schedule1Results[0].EffectiveYear;

                        $("#reportedSchedule1AmendResult").kendoGrid({
                            toolbar: ["excel"],
                            excel: {
                                fileName: "Schedule1.xlsx",
                                allPages: true,
                            },
                            dataSource: {
                                data: schedule1Results,
                                schema: {
                                    model: {
                                        fields: {
                                            Id: { type: "number" },
                                            LicenseID: { type: "number" },
                                            AlcoholName: { type: "string" },
                                            TransactionName: { type: "string" },
                                            Quantity: { type: "decimal" },
                                            SaleTypeName: { type: "string" },
                                            ScheduleType: { type: "string" },
                                        },
                                    },
                                },
                                pageSize: 5,
                            },
                            scrollable: false,
                            sortable: true,
                            pageable: {
                                pageSizes: [5, 10, 20],
                                numeric: false,
                            },
                            filterable: {
                                extra: false,
                                operators: {
                                    string: {
                                        startswith: "Starts with",
                                        eq: "Is equal to",
                                        neq: "Is not equal to",
                                    },
                                },
                            },
                            columns: [
                                { field: "Id", title: "Id", width: "5%", hidden: "true" },
                                {
                                    field: "LicenseID",
                                    title: "License",
                                    width: "5%",
                                    hidden: "true",
                                },
                                {
                                    field: "ScheduleType",
                                    title: "ScheduleType",
                                    width: "5%",
                                    hidden: "true",
                                },
                                { field: "AlcoholName", title: "Alcohol", width: "20%" },
                                { field: "TransactionName", title: "Transaction", width: "15%" },
                                {
                                    field: "Quantity",
                                    title: "Quantity",
                                    width: "10%",
                                    format: "{0:n4}",
                                },
                                { field: "SaleTypeName", title: "Sale type", width: "10%" }
                            ],
                        });
                    }

                    if (schedule2Results.length > 0) {
                        SelectedSchedule2Month = schedule2Results[0].EffectiveMonth;
                        SelectedSchedule2Year = schedule2Results[0].EffectiveYear;


                        $("#reportedSchedule2AmendResult").kendoGrid({
                            toolbar: ["excel"],
                            excel: {
                                fileName: "Schedule2.xlsx",
                                allPages: true,
                            },
                            dataSource: {
                                data: schedule2Results,
                                schema: {
                                    model: {
                                        fields: {
                                            Id: { type: "number" },
                                            LicenseID: { type: "number" },
                                            ScheduleType: { type: "string" },
                                            AlcoholName: { type: "string" },
                                            TransactionName: { type: "string" },
                                            Quantity: { type: "decimal" },
                                            strInvoiceDate: { type: "string" },
                                            InvoiceNumber: { type: "string" },
                                            Permit: { type: "string" },
                                        },
                                    },
                                },
                                pageSize: 5,
                            },
                            scrollable: false,
                            sortable: true,
                            pageable: {
                                pageSizes: [5, 10, 20],
                                numeric: false,
                            },
                            filterable: {
                                extra: false,
                                operators: {
                                    string: {
                                        startswith: "Starts with",
                                        eq: "Is equal to",
                                        neq: "Is not equal to",
                                    },
                                },
                            },
                            columns: [
                                { field: "Id", title: "Id", width: "5%", hidden: "true" },
                                {
                                    field: "LicenseID",
                                    title: "License",
                                    width: "5%",
                                    hidden: "true",
                                },
                                {
                                    field: "ScheduleType",
                                    title: "ScheduleType",
                                    width: "5%",
                                    hidden: "true",
                                },
                                { field: "AlcoholName", title: "Alcohol", width: "20%" },
                                { field: "TransactionName", title: "Transaction", width: "20%" },
                                {
                                    field: "Quantity",
                                    title: "Quantity",
                                    width: "10%",
                                    format: "{0:n4}",
                                },
                                { field: "strInvoiceDate", title: "Invoice Date", width: "10%" },
                                { field: "InvoiceNumber", title: "Invoice Number", width: "10%" },
                                { field: "Permit", title: "Permit", width: "10%" }
                            ],
                        });
                    }

                    if (schedule3Results.length > 0) {

                        if (licenseTypeId == 5) {
                            SelectedSchedule3Month = schedule3Results[0].EffectiveMonth;
                            SelectedSchedule3Year = schedule3Results[0].EffectiveYear;

                            $("#reportedSchedule3AmendResult").kendoGrid({
                                toolbar: ["excel"],
                                excel: {
                                    fileName: "Schedule3.xlsx",
                                    allPages: true,
                                },
                                dataSource: {
                                    data: schedule3Results,
                                    schema: {
                                        model: {
                                            fields: {
                                                Id: { type: "number" },
                                                LicenseID: { type: "number" },
                                                ScheduleType: { type: "string" },
                                                AlcoholName: { type: "string" },
                                                TransactionName: { type: "string" },
                                                Quantity: { type: "decimal" },
                                                strInvoiceDate: { type: "string" },
                                                InvoiceNumber: { type: "string" },
                                                Permit: { type: "string" },
                                                //Price: { type: "decimal" },
                                                //CustomerName: { type: "string" },
                                                //Address: { type: "string" },
                                                //Shipper: { type: "string" },
                                                //Tracking: { type: "string" },
                                            },
                                        },
                                    },
                                    pageSize: 5,
                                },
                                scrollable: false,
                                sortable: true,
                                pageable: {
                                    pageSizes: [5, 10, 20],
                                    numeric: false,
                                },
                                filterable: {
                                    extra: false,
                                    operators: {
                                        string: {
                                            startswith: "Starts with",
                                            eq: "Is equal to",
                                            neq: "Is not equal to",
                                        },
                                    },
                                },
                                columns: [
                                    { field: "Id", title: "Id", width: "5%", hidden: "true" },
                                    {
                                        field: "LicenseID",
                                        title: "License",
                                        width: "10%",
                                        hidden: "true",
                                    },
                                    {
                                        field: "ScheduleType",
                                        title: "ScheduleType",
                                        width: "5%",
                                        hidden: "true",
                                    },
                                    { field: "AlcoholName", title: "Alcohol", width: "10%" },
                                    { field: "TransactionName", title: "Transaction", width: "10%" },
                                    {
                                        field: "Quantity",
                                        title: "Quantity",
                                        width: "10%",
                                        format: "{0:n4}",
                                    },
                                    { field: "strInvoiceDate", title: "Invoice Date", width: "10%" },
                                    { field: "InvoiceNumber", title: "Invoice Number", width: "10%" },
                                    { field: "Permit", title: "Permit", width: "5%" }
                                ],
                            });
                        }
                        else {

                            SelectedSchedule3Month = schedule3Results[0].EffectiveMonth;
                            SelectedSchedule3Year = schedule3Results[0].EffectiveYear;

                            $("#reportedSchedule3AmendResult").kendoGrid({
                                toolbar: ["excel"],
                                excel: {
                                    fileName: "Schedule3.xlsx",
                                    allPages: true,
                                },
                                dataSource: {
                                    data: schedule3Results,
                                    schema: {
                                        model: {
                                            fields: {
                                                Id: { type: "number" },
                                                LicenseID: { type: "number" },
                                                ScheduleType: { type: "string" },
                                                AlcoholName: { type: "string" },
                                                TransactionName: { type: "string" },
                                                Quantity: { type: "decimal" },
                                                strInvoiceDate: { type: "string" },
                                                InvoiceNumber: { type: "string" },
                                                Permit: { type: "string" },
                                                Price: { type: "decimal" },
                                                CustomerName: { type: "string" },
                                                Address: { type: "string" },
                                                Shipper: { type: "string" },
                                                strShippedDate: { type: "string" },
                                                City: { type: "string" },
                                                Brand: { type: "string" },
                                                PackageSizeName: { type: "string" },
                                                Tracking: { type: "string" },
                                            },
                                        },
                                    },
                                    pageSize: 5,
                                },
                                scrollable: false,
                                sortable: true,
                                pageable: {
                                    pageSizes: [5, 10, 20],
                                    numeric: false,
                                },
                                filterable: {
                                    extra: false,
                                    operators: {
                                        string: {
                                            startswith: "Starts with",
                                            eq: "Is equal to",
                                            neq: "Is not equal to",
                                        },
                                    },
                                },
                                columns: [
                                    { field: "Id", title: "Id", width: "5%", hidden: "true" },
                                    {
                                        field: "LicenseID",
                                        title: "License",
                                        width: "10%",
                                        hidden: "true",
                                    },
                                    {
                                        field: "ScheduleType",
                                        title: "ScheduleType",
                                        width: "5%",
                                        hidden: "true",
                                    },
                                    { field: "AlcoholName", title: "Alcohol", width: "10%" },
                                    { field: "TransactionName", title: "Transaction", width: "10%" },
                                    {
                                        field: "Quantity",
                                        title: "Quantity",
                                        width: "10%",
                                        format: "{0:n4}",
                                    },
                                    { field: "strInvoiceDate", title: "Invoice Date", width: "10%" },
                                    { field: "InvoiceNumber", title: "Invoice Number", width: "10%" },
                                    { field: "Permit", title: "Permit", width: "5%" },
                                    {
                                        field: "Price",
                                        title: "Price",
                                        width: "10%",
                                        format: "{0:n4}",
                                    },
                                    { field: "CustomerName", title: "Customer Name", width: "5%" },
                                    { field: "Address", title: "Address", width: "5%" },
                                    { field: "Shipper", title: "Shipper", width: "5%" },
                                    { field: "strShippedDate", title: "Shipped date", width: 160 },
                                    { field: "City", title: "City", width: 130 },
                                    { field: "Brand", title: "Brand", width: 130 },
                                    { field: "PackageSizeName", title: "Package Size", width: 200 },
                                    { field: "Tracking", title: "Tracking", width: "5%" }
                                ],
                            });
                        }
                    }
                    else {
                        document.getElementById('viewschedule3Records_view').classList.add('hidden');
                    }

                    if (schedule4Results.length > 0) {

                        if (licenseTypeId == 5) {

                            SelectedSchedule4Month = schedule4Results[0].EffectiveMonth;
                            SelectedSchedule4Year = schedule4Results[0].EffectiveYear;

                            $("#reportedSchedule4AmendResult").kendoGrid({
                                toolbar: ["excel"],
                                excel: {
                                    fileName: "Schedule4.xlsx",
                                    allPages: true,
                                },
                                dataSource: {
                                    data: schedule4Results,
                                    schema: {
                                        model: {
                                            fields: {
                                                Id: { type: "number" },
                                                LicenseID: { type: "number" },
                                                ScheduleType: { type: "string" },
                                                Permit: { type: "string" },
                                                Brand: { type: "string" },
                                                PackageSizeId: { type: "number" },
                                                PackageSizeName: { type: "string" },
                                                PackageCount: { type: "number" },
                                            },
                                        },
                                    },
                                    pageSize: 5,
                                },
                                scrollable: false,
                                sortable: true,
                                pageable: {
                                    pageSizes: [5, 10, 20],
                                    numeric: false,
                                },
                                filterable: {
                                    extra: false,
                                    operators: {
                                        string: {
                                            startswith: "Starts with",
                                            eq: "Is equal to",
                                            neq: "Is not equal to",
                                        },
                                    },
                                },
                                columns: [
                                    { field: "Id", title: "Id", width: "5%", hidden: "true" },
                                    {
                                        field: "LicenseID",
                                        title: "License",
                                        width: "10%",
                                        hidden: "true",
                                    },
                                    {
                                        field: "ScheduleType",
                                        title: "ScheduleType",
                                        width: "5%",
                                        hidden: "true",
                                    },
                                    /* { field: "Permit", title: "Permit", width: "20%" },*/
                                    { field: "Brand", title: "Brand", width: "20%" },
                                    {
                                        field: "PackageSizeId",
                                        title: "PackageSizeId",
                                        width: "5%",
                                        hidden: "true",
                                    },
                                    { field: "PackageSizeName", title: "Package Size", width: "10%" },
                                    { field: "PackageCount", title: "Package Count", width: "10%" }
                                ],
                            });

                        }
                        else {
                            SelectedSchedule4Month = schedule4Results[0].EffectiveMonth;
                            SelectedSchedule4Year = schedule4Results[0].EffectiveYear;

                            $("#reportedSchedule4AmendResult").kendoGrid({
                                toolbar: ["excel"],
                                excel: {
                                    fileName: "Schedule4.xlsx",
                                    allPages: true,
                                },
                                dataSource: {
                                    data: schedule4Results,
                                    schema: {
                                        model: {
                                            fields: {
                                                Id: { type: "number" },
                                                LicenseID: { type: "number" },
                                                ScheduleType: { type: "string" },
                                                Permit: { type: "string" },
                                                Brand: { type: "string" },
                                                PackageSizeId: { type: "number" },
                                                PackageSizeName: { type: "string" },
                                                PackageCount: { type: "number" },
                                            },
                                        },
                                    },
                                    pageSize: 5,
                                },
                                scrollable: false,
                                sortable: true,
                                pageable: {
                                    pageSizes: [5, 10, 20],
                                    numeric: false,
                                },
                                filterable: {
                                    extra: false,
                                    operators: {
                                        string: {
                                            startswith: "Starts with",
                                            eq: "Is equal to",
                                            neq: "Is not equal to",
                                        },
                                    },
                                },
                                columns: [
                                    { field: "Id", title: "Id", width: "5%", hidden: "true" },
                                    {
                                        field: "LicenseID",
                                        title: "License",
                                        width: "10%",
                                        hidden: "true",
                                    },
                                    {
                                        field: "ScheduleType",
                                        title: "ScheduleType",
                                        width: "5%",
                                        hidden: "true",
                                    },
                                    { field: "Permit", title: "Permit", width: "20%" },
                                    { field: "Brand", title: "Brand", width: "20%" },
                                    {
                                        field: "PackageSizeId",
                                        title: "PackageSizeId",
                                        width: "5%",
                                        hidden: "true",
                                    },
                                    { field: "PackageSizeName", title: "Package Size", width: "10%" },
                                    { field: "PackageCount", title: "Package Count", width: "10%" }
                                ],
                            });
                        }
                    }
                }

                //previewOnlyWebOpenInventoryRecords(); //ET CR Inventory Amendment
                //previewOnlyWebClosingInventoryRecords(); //ET CR Inventory Amendment
            } else {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "No report was found." }, "warning");
            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show(
                { message: "Something went Wrong. Please try again." },
                "error"
            );
        },
    });
}

function previewWebOpenInventoryRecords(selectedLicenseId, reportMonth, reportYear) {

    $.ajax({
        type: "GET",
        url: "/ExciseTax/GetOpenInventoryRecords?LicenseID=" + selectedLicenseId + "&periodMonth=" + reportMonth + "&periodYear=" + reportYear,
        dataType: "json",
        success: function (results) {

            var OpeningInventoryResults = results.Data;

            if (OpeningInventoryResults.length > 0) {
                $("#divOpeningInventoryGrid").kendoGrid({
                    toolbar: ["excel"],
                    excel: {
                        fileName: "OpeningInventory.xlsx",
                        allPages: true,
                    },
                    dataSource: {
                        data: OpeningInventoryResults,
                        schema: {
                            model: {
                                fields: {
                                    Id: { type: "number" },
                                    LicenseID: { type: "number" },
                                    EffectiveMonth: { type: "number" },
                                    EffectiveYear: { type: "number" },
                                    AlcoholName: { type: "string" },
                                    Quantity: { type: "decimal" },
                                    CreatedBy: { type: "string" },
                                    AlcoholTypeId: { type: "number" }
                                },
                            },
                        },
                        pageSize: 5,
                    },
                    scrollable: true,
                    sortable: true,
                    pageable: {
                        pageSizes: [5, 10, 20],
                        numeric: false,
                    },
                    filterable: {
                        extra: false,
                        operators: {
                            string: {
                                startswith: "Starts with",
                                eq: "Is equal to",
                                neq: "Is not equal to",
                            },
                        },
                    },
                    columns: [
                        { field: "Id", title: "Id", width: 130, hidden: "true" },
                        { field: "LicenseID", title: "License", width: 130 },
                        { field: "EffectiveMonth", title: "Effective Month", width: 130 },
                        { field: "EffectiveYear", title: "Effective Year", width: 130 },
                        { field: "AlcoholTypeId", title: "AlcoholTypeId", width: 130 },
                        { field: "AlcoholName", title: "Alcohol", width: 180 },
                        { field: "Quantity", title: "Opening inventory", width: 200, format: "{0:n4}", },
                    ],
                });
            } else {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show(
                    { message: "No records are found on this Opening Inventory." }, "warning");
            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        },
    });
}

function viewallAmendedReportedSchedulesData(applicationId, licenseTypeId = 0) {

    var reportMonth, reportYear;

    document.getElementById("viewallAmendedReportedSchedules").classList.add("hidden");

    $.ajax({
        type: "GET",
        url: "/Process/GetLicenseReportedPeriodAmendmentViewsReadonly?applicationId=" + applicationId,
        dataType: "json",
        contentType: "application/json",
        success: function (results) {

            if (results != null) {
                document
                    .getElementById("viewallAmendedReportedSchedules")
                    .classList.remove("hidden");
                $('html,body').animate({
                    scrollTop: $("#mainAmendedReport").offset().top
                }, 'slow');

                $("#viewreportedSchedule1Result").empty();
                $("#viewreportedSchedule2Result").empty();
                $("#viewreportedSchedule3Result").empty();
                $("#viewreportedSchedule4Result").empty();
                $("#viewreportedCarrierResult").empty();
                $("#viewreportedWarehouseResult").empty();
                $("#viewreportedNonresidentSellerResult").empty();
                //$("#reportedNonresidentBrewerResult").empty();

                var schedule1Results = results.Schedule1.Data;
                var schedule2Results = results.Schedule2.Data;
                var schedule3Results = results.Schedule3.Data;
                var schedule4Results = results.Schedule4.Data;

                var carrierResults = results.CarrierReport.Data;
                var warehouseResults = results.WarehouseReport.Data;
                var nRSResults = results.NonResidentSellerReport.Data;
                var nRBResults = results.NonResidentBrewerReport.Data;

                reportMonth = results.ReportedTotal.PeriodMonth;
                reportYear = results.ReportedTotal.PeriodYear;

                checkLicenseType(licenseTypeId);

                SelectedSchedule1Month = reportMonth;
                SelectedSchedule1Year = reportYear;
                SelectedSchedule2Month = reportMonth;
                SelectedSchedule2Year = reportYear;
                SelectedSchedule3Month = reportMonth;
                SelectedSchedule3Year = reportYear;
                SelectedSchedule4Month = reportMonth;
                SelectedSchedule4Year = reportYear;

                SelectedCarrierMonth = reportMonth
                SelectedCarrierYear = reportYear;
                SelectedWarehouseMonth = reportMonth;
                SelectedWarehouseYear = reportYear;
                SelectedNonresidentSellerMonth = reportMonth;
                SelectedNonresidentSellerYear = reportYear;
                SelectedNonresidentBrewerMonth = reportMonth;
                SelectedNonresidentBrewerYear = reportYear;
                if (carrierResults.length > 0 || warehouseResults.length > 0 || nRSResults.length > 0) {
                    if (carrierResults.length > 0) {
                        SelectedCarrierMonth = carrierResults[0].EffectiveMonth;
                        SelectedCarrierYear = carrierResults[0].EffectiveYear;

                        $("#reportedCarrierAmendResult").kendoGrid({
                            toolbar: ["excel"],
                            excel: {
                                fileName: "CarrierReport.xlsx",
                                allPages: true,
                            },
                            dataSource: {
                                data: carrierResults,
                                schema: {
                                    model: {
                                        fields: {
                                            Id: { type: "number" },
                                            OriginalCarrierRecordId: { type: "number" },
                                            LicenseId: { type: "number" },
                                            EffectiveMonth: { type: "number" },
                                            EffectiveYear: { type: "number" },
                                            Consignor: { type: "string" },
                                            Consignee: { type: "string" },
                                            PointOfOrigin: { type: "string" },
                                            Destination: { type: "string" },
                                            CommodityType: { type: "string" },
                                            strDeliveryDate: { type: "string" },
                                            FreightBillNumber: { type: "string" },
                                            CommodityTypeId: { type: "number" },
                                            NumberOfPackages: { type: "number" },
                                            strShippedDate: { type: "string" },
                                            IsAmended: { type: "boolean" },
                                            ApplicationId: { type: "number" }
                                            , ChangeReason: { type: "string" }
                                        },
                                    },
                                },
                                pageSize: 5,
                            },
                            scrollable: false,
                            sortable: true,
                            pageable: true,
                            filterable: {
                                extra: false,
                                operators: {
                                    string: {
                                        startswith: "Starts with",
                                        eq: "Is equal to",
                                        neq: "Is not equal to",
                                    },
                                },
                            },
                            columns: [
                                { field: "Id", title: "Id", width: "5%", hidden: "true" },
                                { field: "OriginalCarrierRecordId", title: "OriginalCarrierRecordId", width: "5%", hidden: "true" },
                                { field: "IsAmended", title: "IsAmended", width: "5%", hidden: "true" },
                                { field: "ApplicationId", title: "ApplicationId", width: "5%", hidden: "true" },
                                { field: "ScheduleType", title: "ScheduleType", width: "5%", hidden: "true" },
                                {
                                    field: "LicenseId",
                                    title: "License",
                                    width: "5%",
                                    hidden: "true",
                                },
                                {
                                    field: "Consignor",
                                    title: "Consignor",
                                    width: "5%",
                                    hidden: "true",
                                },
                                { field: "Consignee", title: "Consignee", width: "15%" },
                                { field: "PointOfOrigin", title: "Point Of Origin", width: "15%" },
                                { field: "Destination", title: "Destination", width: "10%" },
                                { field: "CommodityType", title: "Commodity Type", width: "10%" },
                                { field: "NumberOfPackages", title: "No of Packages", width: "5%" },
                                { field: "ChangeReason", title: "Change Reason", width: "15%" },
                            ],
                        });
                    }
                    else if (warehouseResults.length > 0) {
                        SelectedWarehouseMonth = warehouseResults[0].ReportingMonth;
                        SelectedWarehouseYear = warehouseResults[0].ReportingYear;

                        $("#reportedWarehouseAmendResult").kendoGrid({
                            toolbar: ["excel"],
                            excel: {
                                fileName: "WarehouseReport.xlsx",
                                allPages: true,
                            },
                            dataSource: {
                                data: warehouseResults,
                                schema: {
                                    model: {
                                        fields: {
                                            Id: { type: "number" },
                                            OriginalWarehouseRecordId: { type: "number" },
                                            LicenseId: { type: "number" },
                                            ReportingMonth: { type: "number" },
                                            ReportingYear: { type: "number" },
                                            WRPermit: { type: "string" },
                                            WRTransactionTypes: { type: "string" },
                                            ScheduleType: { type: "string" },
                                            WRSpirits: { type: "decimal" },
                                            WRLowWine: { type: "decimal" },
                                            WRHighWine: { type: "decimal" },
                                            WRSparklingWine: { type: "decimal" },
                                            WRMalt: { type: "decimal" },
                                            WRTransactionTypeId: { type: "number" },
                                            IsAmended: { type: "boolean" },
                                            ApplicationId: { type: "number" }
                                            , ChangeReason: { type: "string" }
                                        },
                                    },
                                },
                                pageSize: 5,
                            },
                            scrollable: false,
                            sortable: true,
                            pageable: true,
                            filterable: {
                                extra: false,
                                operators: {
                                    string: {
                                        startswith: "Starts with",
                                        eq: "Is equal to",
                                        neq: "Is not equal to",
                                    },
                                },
                            },
                            columns: [
                                { field: "Id", title: "Id", width: "5%", hidden: "true" },
                                { field: "OriginalWarehouseRecordId", title: "OriginalWarehouseRecordId", width: "5%", hidden: "true" },
                                { field: "IsAmended", title: "IsAmended", width: "5%", hidden: "true" },
                                { field: "ApplicationId", title: "ApplicationId", width: "5%", hidden: "true" },
                                { field: "LicenseId", title: "License", width: "5%", hidden: "true" },
                                { field: "ScheduleType", title: "ScheduleType", width: "5%", hidden: "true" },
                                { field: "WRPermit", title: "Permit", width: "10%" },
                                { field: "WRSpirits", title: "Spirits", width: "10%", format: "{0:n4}" },
                                { field: "WRLowWine", title: "WRLowWine", width: "20%", format: "{0:n4}" },
                                { field: "WRHighWine", title: "WRHighWine", width: "20%", format: "{0:n4}" },
                                { field: "WRSparklingWine", title: "WRSparklingWine", width: "20%", format: "{0:n4}" },
                                { field: "WRMalt", title: "WRMalt", width: "20%", format: "{0:n4}" },
                                {
                                    field: "WRTransactionTypes",
                                    title: "Transaction"
                                },
                                { field: "ChangeReason", title: "Change Reason", width: "15%" },
                            ],
                        });
                    }
                    else if (nRSResults.length > 0) {
                        reportingMonthNRS = nRSResults[0].ReportingMonth;
                        reportingYearNRS = nRSResults[0].ReportingYear;
                        SelectedNonresidentSellerMonth = nRSResults[0].ReportingMonth;
                        SelectedNonresidentSellerYear = nRSResults[0].ReportingYear;

                        $("#reportedNonresidentSellerAmendResult").kendoGrid({
                            toolbar: ["excel"],
                            excel: {
                                fileName: "NonresidentSellerReport.xlsx",
                                allPages: true,
                            },
                            dataSource: {
                                data: nRSResults,
                                schema: {
                                    model: {
                                        fields: {
                                            Id: { type: "number" },
                                            OriginalNRSRecordID: { type: "number" },
                                            LicenseID: { type: "string" },
                                            TransactionType: { type: "string" },
                                            InvoiceNumber: { type: "string" },
                                            strInvoiceDate: { type: "string" },
                                            AlcoholType: { type: "string" },
                                            Permit: { type: "string" },
                                            ScheduleType: { type: "string" },
                                            TransactionId: { type: "number" },
                                            AlcoholTypeId: { type: "number" },
                                            InvoiceDate: { type: "string" },
                                            IsAmended: { type: "boolean" },
                                            ApplicationId: { type: "number" }
                                            , ChangeReason: { type: "string" }
                                        },
                                    },
                                },
                                pageSize: 5,
                            },
                            scrollable: false,
                            sortable: true,
                            pageable: true,
                            filterable: {
                                extra: false,
                                operators: {
                                    string: {
                                        startswith: "Starts with",
                                        eq: "Is equal to",
                                        neq: "Is not equal to",
                                    },
                                },
                            },
                            columns: [
                                { field: "Id", title: "Id", width: "5%", hidden: "true" },
                                { field: "OriginalNRSRecordID", title: "OriginalNRSRecordID", width: "5%", hidden: "true" },
                                { field: "IsAmended", title: "IsAmended", width: "5%", hidden: "true" },
                                { field: "ApplicationId", title: "ApplicationId", width: "5%", hidden: "true" },
                                {
                                    field: "LicenseID",
                                    title: "License",
                                    width: "5%",
                                    hidden: "true",
                                },
                                {
                                    field: "ScheduleType",
                                    title: "ScheduleType",
                                    width: "5%",
                                    hidden: "true",
                                },
                                { field: "Permit", title: "Permit", width: "20%" },
                                { field: "TransactionType", title: "Transaction Type", width: "15%" },
                                { field: "AlcoholType", title: "Alcohol Type", width: "15%" },
                                { field: "Quantity", title: "Quantity", width: "15%" },
                                // { field: "InvoiceDate", title: "Invoice Date", width: "15%" },
                                { field: "strInvoiceDate", title: "Invoice Date", width: "15%" },
                                { field: "InvoiceNumber", title: "Invoice Number", width: "15%" },
                                { field: "AlcoholTypeId", title: "AlcoholTypeId", width: "5%", hidden: "true" },
                                { field: "TransactionId", title: "TransactionId", width: "5%", hidden: "true" },
                                { field: "ChangeReason", title: "Change Reason", width: "15%" },
                            ],
                        });
                    }
                }
                else {
                    if (schedule1Results.length > 0) {
                        SelectedSchedule1Month = schedule1Results[0].EffectiveMonth;
                        SelectedSchedule1Year = schedule1Results[0].EffectiveYear;

                        $("#reportedSchedule1AmendResult").kendoGrid({
                            toolbar: ["excel"],
                            excel: {
                                fileName: "Schedule1.xlsx",
                                allPages: true,
                            },
                            dataSource: {
                                data: schedule1Results,
                                schema: {
                                    model: {
                                        fields: {
                                            Id: { type: "number" },
                                            OriginalSchedule1Id: { type: "number" },
                                            LicenseID: { type: "number" },
                                            AlcoholName: { type: "string" },
                                            TransactionName: { type: "string" },
                                            Quantity: { type: "decimal" },
                                            SaleTypeName: { type: "string" },
                                            ScheduleType: { type: "string" },
                                            IsAmended: { type: "boolean" },
                                            ApplicationId: { type: "number" }
                                            , IsCreditMemo: { type: "boolean" }
                                            , ChangeReason: { type: "string" }
                                        },
                                    },
                                },
                                pageSize: 5,
                            },
                            scrollable: false,
                            sortable: true,
                            pageable: {
                                pageSizes: [5, 10, 20],
                                numeric: false,
                            },
                            filterable: {
                                extra: false,
                                operators: {
                                    string: {
                                        startswith: "Starts with",
                                        eq: "Is equal to",
                                        neq: "Is not equal to",
                                    },
                                },
                            },
                            columns: [
                                { field: "Id", title: "Id", width: "5%", hidden: "true" },
                                { field: "OriginalSchedule1Id", title: "OriginalSchedule1Id", width: "5%", hidden: "true" },
                                { field: "IsAmended", title: "IsAmended", width: "5%", hidden: "true" },
                                { field: "ApplicationId", title: "ApplicationId", width: "5%", hidden: "true" },
                                {
                                    field: "LicenseID",
                                    title: "License",
                                    width: "5%",
                                    hidden: "true",
                                },
                                {
                                    field: "ScheduleType",
                                    title: "ScheduleType",
                                    width: "5%",
                                    hidden: "true",
                                },
                                { field: "AlcoholName", title: "Alcohol", width: "20%" },
                                { field: "TransactionName", title: "Transaction", width: "15%" },
                                {
                                    field: "Quantity",
                                    title: "Quantity",
                                    width: "10%",
                                    format: "{0:n4}",
                                },
                                { field: "SaleTypeName", title: "Sale type", width: "10%" },
                                { field: "IsCreditMemo", title: "IsCreditMemo", width: "10%", hidden: "true" },
                                { field: "ChangeReason", title: "Change Reason", width: "15%" },
                            ],
                        });
                    } else {
                        document.getElementById('viewschedule1Records_view').classList.add('hidden');
                    }

                    if (schedule2Results.length > 0) {
                        SelectedSchedule2Month = schedule2Results[0].EffectiveMonth;
                        SelectedSchedule2Year = schedule2Results[0].EffectiveYear;


                        $("#reportedSchedule2AmendResult").kendoGrid({
                            toolbar: ["excel"],
                            excel: {
                                fileName: "Schedule2.xlsx",
                                allPages: true,
                            },
                            dataSource: {
                                data: schedule2Results,
                                schema: {
                                    model: {
                                        fields: {
                                            Id: { type: "number" },
                                            OriginalSchedule2Id: { type: "number" },
                                            LicenseID: { type: "number" },
                                            ScheduleType: { type: "string" },
                                            AlcoholName: { type: "string" },
                                            TransactionName: { type: "string" },
                                            Quantity: { type: "decimal" },
                                            strInvoiceDate: { type: "string" },
                                            InvoiceNumber: { type: "string" },
                                            Permit: { type: "string" },
                                            IsAmended: { type: "boolean" },
                                            ApplicationId: { type: "number" }
                                            , IsCreditMemo: { type: "boolean" }
                                            , ChangeReason: { type: "string" }
                                        },
                                    },
                                },
                                pageSize: 5,
                            },
                            scrollable: false,
                            sortable: true,
                            pageable: {
                                pageSizes: [5, 10, 20],
                                numeric: false,
                            },
                            filterable: {
                                extra: false,
                                operators: {
                                    string: {
                                        startswith: "Starts with",
                                        eq: "Is equal to",
                                        neq: "Is not equal to",
                                    },
                                },
                            },
                            columns: [
                                { field: "Id", title: "Id", width: "5%", hidden: "true" },
                                { field: "IsAmended", title: "IsAmended", width: "5%", hidden: "true" },
                                { field: "ApplicationId", title: "ApplicationId", width: "5%", hidden: "true" },
                                {
                                    field: "LicenseID",
                                    title: "License",
                                    width: "5%",
                                    hidden: "true",
                                },
                                {
                                    field: "ScheduleType",
                                    title: "ScheduleType",
                                    width: "5%",
                                    hidden: "true",
                                },
                                { field: "AlcoholName", title: "Alcohol", width: "20%" },
                                { field: "TransactionName", title: "Transaction", width: "20%" },
                                {
                                    field: "Quantity",
                                    title: "Quantity",
                                    width: "10%",
                                    format: "{0:n4}",
                                },
                                { field: "strInvoiceDate", title: "Invoice Date", width: "10%" },
                                { field: "InvoiceNumber", title: "Invoice Number", width: "10%" },
                                { field: "Permit", title: "Permit", width: "10%" },
                                { field: "IsCreditMemo", title: "IsCreditMemo", width: "10%", hidden: "true" },
                                { field: "ChangeReason", title: "Change Reason", width: "15%" },
                            ],
                        });
                    } else {
                        document.getElementById('viewschedule2Records_view').classList.add('hidden');
                    }

                    if (schedule3Results.length > 0) {


                        if (licenseTypeId == 5) {
                            SelectedSchedule3Month = schedule3Results[0].EffectiveMonth;
                            SelectedSchedule3Year = schedule3Results[0].EffectiveYear;

                            $("#reportedSchedule3AmendResult").kendoGrid({
                                toolbar: ["excel"],
                                excel: {
                                    fileName: "Schedule3.xlsx",
                                    allPages: true,
                                },
                                dataSource: {
                                    data: schedule3Results,
                                    schema: {
                                        model: {
                                            fields: {
                                                Id: { type: "number" },
                                                OriginalSchedule3Id: { type: "number" },
                                                LicenseID: { type: "number" },
                                                ScheduleType: { type: "string" },
                                                AlcoholName: { type: "string" },
                                                TransactionName: { type: "string" },
                                                Quantity: { type: "decimal" },
                                                strInvoiceDate: { type: "string" },
                                                InvoiceNumber: { type: "string" },
                                                Permit: { type: "string" },
                                                IsAmended: { type: "boolean" },
                                                ApplicationId: { type: "number" }
                                                , IsCreditMemo: { type: "boolean" }
                                                , ChangeReason: { type: "string" }
                                            },
                                        },
                                    },
                                    pageSize: 5,
                                },
                                scrollable: false,
                                sortable: true,
                                pageable: {
                                    pageSizes: [5, 10, 20],
                                    numeric: false,
                                },
                                filterable: {
                                    extra: false,
                                    operators: {
                                        string: {
                                            startswith: "Starts with",
                                            eq: "Is equal to",
                                            neq: "Is not equal to",
                                        },
                                    },
                                },
                                columns: [
                                    { field: "Id", title: "Id", width: "5%", hidden: "true" },
                                    { field: "OriginalSchedule3Id", title: "OriginalSchedule3Id", width: "5%", hidden: "true" },
                                    { field: "IsAmended", title: "IsAmended", width: "5%", hidden: "true" },
                                    { field: "ApplicationId", title: "ApplicationId", width: "5%", hidden: "true" },
                                    {
                                        field: "LicenseID",
                                        title: "License",
                                        width: "10%",
                                        hidden: "true",
                                    },
                                    {
                                        field: "ScheduleType",
                                        title: "ScheduleType",
                                        width: "5%",
                                        hidden: "true",
                                    },
                                    { field: "AlcoholName", title: "Alcohol", width: "10%" },
                                    { field: "TransactionName", title: "Transaction", width: "10%" },
                                    {
                                        field: "Quantity",
                                        title: "Quantity",
                                        width: "10%",
                                        format: "{0:n4}",
                                    },
                                    { field: "strInvoiceDate", title: "Invoice Date", width: "10%" },
                                    { field: "InvoiceNumber", title: "Invoice Number", width: "10%" },
                                    { field: "Permit", title: "Permit", width: "5%" },
                                    { field: "IsCreditMemo", title: "IsCreditMemo", width: "10%", hidden: "true" },
                                    { field: "ChangeReason", title: "Change Reason", width: "15%" },
                                ],
                            });
                        }
                        else {

                            SelectedSchedule3Month = schedule3Results[0].EffectiveMonth;
                            SelectedSchedule3Year = schedule3Results[0].EffectiveYear;

                            $("#reportedSchedule3AmendResult").kendoGrid({
                                toolbar: ["excel"],
                                excel: {
                                    fileName: "Schedule3.xlsx",
                                    allPages: true,
                                },
                                dataSource: {
                                    data: schedule3Results,
                                    schema: {
                                        model: {
                                            fields: {
                                                Id: { type: "number" },
                                                OriginalSchedule3Id: { type: "number" },
                                                LicenseID: { type: "number" },
                                                ScheduleType: { type: "string" },
                                                AlcoholName: { type: "string" },
                                                TransactionName: { type: "string" },
                                                Quantity: { type: "decimal" },
                                                strInvoiceDate: { type: "string" },
                                                InvoiceNumber: { type: "string" },
                                                //Permit: { type: "string" },
                                                Price: { type: "decimal" },
                                                CustomerName: { type: "string" },
                                                Address: { type: "string" },
                                                Shipper: { type: "string" },
                                                strShippedDate: { type: "string" },
                                                City: { type: "string" },
                                                Brand: { type: "string" },
                                                PackageSizeName: { type: "string" },
                                                Tracking: { type: "string" },
                                                IsAmended: { type: "boolean" },
                                                ApplicationId: { type: "number" }
                                                , IsCreditMemo: { type: "boolean" }
                                                , ChangeReason: { type: "string" }
                                            },
                                        },
                                    },
                                    pageSize: 5,
                                },
                                groupable: true,
                                scrollable: true,
                                sortable: true,
                                columnMenu: true,
                                pageable: {
                                    pageSizes: [5, 10, 20],
                                    numeric: false,
                                },
                                filterable: {
                                    extra: false,
                                    operators: {
                                        string: {
                                            startswith: "Starts with",
                                            eq: "Is equal to",
                                            neq: "Is not equal to",
                                        },
                                    },
                                },
                                columns: [
                                    { field: "Id", title: "Id", width: "150px", hidden: "true" },
                                    { field: "OriginalSchedule3Id", title: "OriginalSchedule3Id", width: "150px", hidden: "true" },
                                    { field: "IsAmended", title: "IsAmended", width: "5%", hidden: "true" },
                                    { field: "ApplicationId", title: "ApplicationId", width: "5%", hidden: "true" },
                                    {
                                        field: "LicenseID",
                                        title: "License",
                                        width: "150px",
                                        hidden: "true",
                                    },
                                    {
                                        field: "ScheduleType",
                                        title: "ScheduleType",
                                        width: "150px",
                                        hidden: "true",
                                    },
                                    { field: "AlcoholName", title: "Alcohol", width: "150px" },
                                    { field: "TransactionName", title: "Transaction", width: "150px" },
                                    {
                                        field: "Quantity",
                                        title: "Quantity",
                                        width: "150px",
                                        format: "{0:n4}",
                                    },
                                    { field: "strInvoiceDate", title: "Invoice Date", width: "150px" },
                                    { field: "InvoiceNumber", title: "Invoice Number", width: "150px" },
                                    //{ field: "Permit", title: "Permit", width: "5%" },
                                    {
                                        field: "Price",
                                        title: "Price",
                                        width: "150px",
                                        format: "{0:n4}",
                                    },
                                    { field: "CustomerName", title: "Customer Name", width: "5%" },
                                    { field: "Address", title: "Address", width: "5%" },
                                    { field: "Shipper", title: "Shipper", width: "5%" },
                                    { field: "strShippedDate", title: "Shipped date", width: 160 },
                                    { field: "City", title: "City", width: 130 },
                                    { field: "Brand", title: "Brand", width: 130 },
                                    { field: "PackageSizeName", title: "Package Size", width: 200 },
                                    { field: "Tracking", title: "Tracking", width: "5%" },
                                    { field: "IsCreditMemo", title: "IsCreditMemo", width: "10%", hidden: "true" },
                                    { field: "ChangeReason", title: "Change Reason", width: "15%" },
                                ],
                            });
                        }
                    } else {
                        document.getElementById('viewschedule3Records_view').classList.add('hidden');
                    }

                    if (schedule4Results.length > 0) {
                        
                        if (licenseTypeId == 5) {

                            SelectedSchedule4Month = schedule4Results[0].EffectiveMonth;
                            SelectedSchedule4Year = schedule4Results[0].EffectiveYear;

                            $("#reportedSchedule4AmendResult").kendoGrid({
                                toolbar: ["excel"],
                                excel: {
                                    fileName: "Schedule4.xlsx",
                                    allPages: true,
                                },
                                dataSource: {
                                    data: schedule4Results,
                                    schema: {
                                        model: {
                                            fields: {
                                                Id: { type: "number" },
                                                OriginalSchedule4Id: { type: "number" },
                                                LicenseID: { type: "number" },
                                                ScheduleType: { type: "string" },
                                                Permit: { type: "string" },
                                                Brand: { type: "string" },
                                                PackageSizeId: { type: "number" },
                                                PackageSizeName: { type: "string" },
                                                PackageCount: { type: "number" },
                                                IsAmended: { type: "boolean" },
                                                ApplicationId: { type: "number" }
                                                , ChangeReason: { type: "string" }
                                            },
                                        },
                                    },
                                    pageSize: 5,
                                },
                                scrollable: false,
                                sortable: true,
                                pageable: {
                                    pageSizes: [5, 10, 20],
                                    numeric: false,
                                },
                                filterable: {
                                    extra: false,
                                    operators: {
                                        string: {
                                            startswith: "Starts with",
                                            eq: "Is equal to",
                                            neq: "Is not equal to",
                                        },
                                    },
                                },
                                columns: [
                                    { field: "Id", title: "Id", width: "5%", hidden: "true" },
                                    { field: "OriginalSchedule4Id", title: "OriginalSchedule4Id", width: "5%", hidden: "true" },
                                    { field: "IsAmended", title: "IsAmended", width: "5%", hidden: "true" },
                                    { field: "ApplicationId", title: "ApplicationId", width: "5%", hidden: "true" },
                                    {
                                        field: "LicenseID",
                                        title: "License",
                                        width: "10%",
                                        hidden: "true",
                                    },
                                    {
                                        field: "ScheduleType",
                                        title: "ScheduleType",
                                        width: "5%",
                                        hidden: "true",
                                    },
                                    /* { field: "Permit", title: "Permit", width: "20%" },*/
                                    { field: "Brand", title: "Brand", width: "20%" },
                                    {
                                        field: "PackageSizeId",
                                        title: "PackageSizeId",
                                        width: "5%",
                                        hidden: "true",
                                    },
                                    { field: "PackageSizeName", title: "Package Size", width: "10%" },
                                    { field: "PackageCount", title: "Package Count", width: "10%" },
                                    { field: "ChangeReason", title: "Change Reason", width: "15%" },
                                ],
                            });

                        }
                        else {
                            SelectedSchedule4Month = schedule4Results[0].EffectiveMonth;
                            SelectedSchedule4Year = schedule4Results[0].EffectiveYear;

                            $("#reportedSchedule4AmendResult").kendoGrid({
                                toolbar: ["excel"],
                                excel: {
                                    fileName: "Schedule4.xlsx",
                                    allPages: true,
                                },
                                dataSource: {
                                    data: schedule4Results,
                                    schema: {
                                        model: {
                                            fields: {
                                                Id: { type: "number" },
                                                OriginalSchedule4Id: { type: "number" },
                                                LicenseID: { type: "number" },
                                                ScheduleType: { type: "string" },
                                                Permit: { type: "string" },
                                                Brand: { type: "string" },
                                                PackageSizeId: { type: "number" },
                                                PackageSizeName: { type: "string" },
                                                PackageCount: { type: "number" },
                                                IsAmended: { type: "boolean" },
                                                ApplicationId: { type: "number" }
                                                , ChangeReason: { type: "string" }
                                            },
                                        },
                                    },
                                    pageSize: 5,
                                },
                                scrollable: false,
                                sortable: true,
                                pageable: {
                                    pageSizes: [5, 10, 20],
                                    numeric: false,
                                },
                                filterable: {
                                    extra: false,
                                    operators: {
                                        string: {
                                            startswith: "Starts with",
                                            eq: "Is equal to",
                                            neq: "Is not equal to",
                                        },
                                    },
                                },
                                columns: [
                                    { field: "Id", title: "Id", width: "5%", hidden: "true" },
                                    { field: "OriginalSchedule4Id", title: "OriginalSchedule4Id", width: "5%", hidden: "true" },
                                    { field: "IsAmended", title: "IsAmended", width: "5%", hidden: "true" },
                                    { field: "ApplicationId", title: "ApplicationId", width: "5%", hidden: "true" },
                                    {
                                        field: "LicenseID",
                                        title: "License",
                                        width: "10%",
                                        hidden: "true",
                                    },
                                    {
                                        field: "ScheduleType",
                                        title: "ScheduleType",
                                        width: "5%",
                                        hidden: "true",
                                    },
                                    { field: "Permit", title: "Permit", width: "20%" },
                                    { field: "Brand", title: "Brand", width: "20%" },
                                    {
                                        field: "PackageSizeId",
                                        title: "PackageSizeId",
                                        width: "5%",
                                        hidden: "true",
                                    },
                                    { field: "PackageSizeName", title: "Package Size", width: "10%" },
                                    { field: "PackageCount", title: "Package Count", width: "10%" },
                                    { field: "ChangeReason", title: "Change Reason", width: "15%" },
                                ],
                            });
                        }
                    } else {
                        document.getElementById('viewschedule4Records_view').classList.add('hidden');
                    }
                }

            } else {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "No report was found." }, "warning");
            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show(
                { message: "Something went Wrong. Please try again." },
                "error"
            );
        },
    });
}

function GetMonthName(monthNumber) {
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[monthNumber - 1];
}

function checkLicenseType(selectedLicenseTypeId) {

    document.getElementById("viewschedule1Records_view").classList.remove("hidden");
    document.getElementById("viewschedule3Records_view").classList.remove("hidden");
    document.getElementById("viewschedule2Records_view").classList.remove("hidden");
    document.getElementById("viewschedule4Records_view").classList.remove("hidden");

    document.getElementById("viewcarrierRecords_view").classList.remove("hidden");
    document.getElementById("viewwarehouseRecords_view").classList.remove("hidden");
    document.getElementById("viewnonresidentSellerRecords_view").classList.remove("hidden");

    if (
        selectedLicenseTypeId == 26 ||
        selectedLicenseTypeId == 24 ||
        selectedLicenseTypeId == 6

    ) {
        document.getElementById("viewschedule1Records_view").classList.add("hidden");
        document.getElementById("viewschedule3Records_view").classList.add("hidden");
        document.getElementById("viewschedule2Records_view").classList.add("hidden");
        document.getElementById("viewschedule4Records_view").classList.add("hidden");

        if (selectedLicenseTypeId == 26) {
            document.getElementById("viewwarehouseRecords_view").classList.add("hidden");
            document.getElementById("viewnonresidentSellerRecords_view").classList.add("hidden");

        } else if (selectedLicenseTypeId == 24) {
            document.getElementById("viewcarrierRecords_view").classList.add("hidden");
            document.getElementById("viewnonresidentSellerRecords_view").classList.add("hidden");
        } else if (selectedLicenseTypeId == 6) {
            document.getElementById("viewcarrierRecords_view").classList.add("hidden");
            document.getElementById("viewwarehouseRecords_view").classList.add("hidden");
        }
    }
    else {
        if (
            selectedLicenseTypeId == 1 ||
            selectedLicenseTypeId == 29 ||
            selectedLicenseTypeId == 7 ||
            selectedLicenseTypeId == 32 ||
            selectedLicenseTypeId == 8 ||
            selectedLicenseTypeId == 9 ||
            selectedLicenseTypeId == 31 ||
            selectedLicenseTypeId == 10
        ) {
            document.getElementById("viewschedule3Records_view").classList.add("hidden");
            document.getElementById("viewwarehouseRecords_view").classList.add("hidden");
            document.getElementById("viewnonresidentSellerRecords_view").classList.add("hidden");
            document.getElementById("viewcarrierRecords_view").classList.add("hidden");
        }

        if (
            selectedLicenseTypeId == 4 || selectedLicenseTypeId == 5
        ) {
            document.getElementById("viewschedule2Records_view").classList.add("hidden");
            document.getElementById("viewwarehouseRecords_view").classList.add("hidden");
            document.getElementById("viewnonresidentSellerRecords_view").classList.add("hidden");
            document.getElementById("viewcarrierRecords_view").classList.add("hidden");
        }

        if (
            selectedLicenseTypeId == 7 ||
            selectedLicenseTypeId == 8 ||
            selectedLicenseTypeId == 9 ||
            selectedLicenseTypeId == 31 ||
            selectedLicenseTypeId == 32 ||
            selectedLicenseTypeId == 4 ||
            selectedLicenseTypeId == 5
        ) {
            document.getElementById("viewschedule1Records_view").classList.add("hidden");
            document.getElementById("viewwarehouseRecords_view").classList.add("hidden");
            document.getElementById("viewnonresidentSellerRecords_view").classList.add("hidden");
            document.getElementById("viewcarrierRecords_view").classList.add("hidden");

        }

        if (
            selectedLicenseTypeId == 2 ||
            selectedLicenseTypeId == 3 ||
            selectedLicenseTypeId == 4 ||
            selectedLicenseTypeId == 8

        ) {
            document.getElementById("viewschedule4Records_view").classList.add("hidden");
            document.getElementById("viewwarehouseRecords_view").classList.add("hidden");
            document.getElementById("viewnonresidentSellerRecords_view").classList.add("hidden");
            document.getElementById("viewcarrierRecords_view").classList.add("hidden");
        }
    }
}

function previewAmendClosingInventoryRecords(applicationId) {
    var reportMonth = $("#hdnReportMonth").val();
    var reportYear = $("#hdnReportYear").val();
    $.ajax({
        type: "GET",
        url: "/Process/GetWebSummaryAmendRecords?applicationId=" + applicationId + "&periodMonth=" + reportMonth + "&periodYear=" + reportYear,
        dataType: "json",
        success: function (results) {
            $("#endingInvResult").empty();
            var EndingInventoryResults = results.Data;
            if (EndingInventoryResults.length > 0) {
                /* document.getElementById("btnOIWeb").classList.remove("hidden");*/
                $("#endingInvResult").kendoGrid({
                    toolbar: ["excel"],
                    excel: {
                        fileName: "EndingInventory.xlsx",
                        allPages: true,
                    },
                    dataSource: {
                        data: EndingInventoryResults,
                        schema: {
                            model: {
                                fields: {
                                    Id: { type: "number" },
                                    ApplicationId: { type: "number" },
                                    OriginalSummaryId: { type: "number" },
                                    EffectiveMonth: { type: "number" },
                                    EffectiveYear: { type: "number" },
                                    LicenseID: { type: "number" },
                                    AlcoholName: { type: "string" },
                                    Quantity: { type: "decimal" },
                                    AlcoholTypeId: { type: "number" },
                                    ChangeReason: { type: "string" }
                                },
                            },
                        },
                        pageSize: 5,
                    },
                    scrollable: true,
                    sortable: true,
                    pageable: {
                        pageSizes: [5, 10, 20],
                        numeric: false,
                    },
                    filterable: {
                        extra: false,
                        operators: {
                            string: {
                                startswith: "Starts with",
                                eq: "Is equal to",
                                neq: "Is not equal to",
                            },
                        },
                    },
                    columns: [
                        { field: "Id", title: "Id", width: 130, hidden: "true" },
                        { field: "OriginalSummaryId", title: "OriginalSummaryId", width: 130, hidden: "true" },
                        { field: "ApplicationId", title: "ApplicationId", width: 130, hidden: "true" },
                        { field: "EffectiveMonth", title: "Effective Month", width: 130 },
                        { field: "EffectiveYear", title: "Effective Year", width: 130 },
                        { field: "AlcoholTypeId", title: "AlcoholTypeId", width: 130 },
                        { field: "LicenseID", title: "License", width: 130 },
                        { field: "AlcoholName", title: "Alcohol", width: 130 },
                        { field: "Quantity", title: "Ending inventory", width: 130, format: "{0:n4}", },
                        { field: "ChangeReason", title: "Change Reason", width: 130 },
                    ],
                });
            } else {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show(
                    { message: "No records are found on this Opening Inventory." }, "warning");
            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        },
    });
}

function previewWebClosingInventoryRecords(selectedLicenseId, reportMonth, reportYear) {

    $.ajax({
        type: "GET",
        url: "/ExciseTax/GetWebSummaryRecords?LicenseID=" + selectedLicenseId + "&periodMonth=" + reportMonth + "&periodYear=" + reportYear,
        dataType: "json",
        success: function (results) {
            $("#endingInvResult").empty();
            var OpeningInventoryResults = results.Data;

            if (OpeningInventoryResults.length > 0) {
                $("#endingInvResult").kendoGrid({
                    toolbar: ["excel"],
                    excel: {
                        fileName: "ClosingInventory.xlsx",
                        allPages: true,
                    },
                    dataSource: {
                        data: OpeningInventoryResults,
                        schema: {
                            model: {
                                fields: {
                                    Id: { type: "number" },
                                    LicenseID: { type: "number" },
                                    AlcoholName: { type: "string" },
                                    Quantity: { type: "decimal" },
                                    CreatedBy: { type: "string" },
                                    AlcoholTypeId: { type: "number" }
                                },
                            },
                        },
                        pageSize: 5,
                    },
                    scrollable: true,
                    sortable: true,
                    pageable: {
                        pageSizes: [5, 10, 20],
                        numeric: false,
                    },
                    filterable: {
                        extra: false,
                        operators: {
                            string: {
                                startswith: "Starts with",
                                eq: "Is equal to",
                                neq: "Is not equal to",
                            },
                        },
                    },
                    columns: [
                        { field: "Id", title: "Id", width: 130, hidden: "true" },
                        { field: "AlcoholTypeId", title: "AlcoholTypeId", width: 130, hidden: "true" },
                        { field: "LicenseID", title: "License", width: 130, hidden: "true", },
                        { field: "AlcoholName", title: "Alcohol", width: 180 },
                        { field: "Quantity", title: "Closing inventory", width: 200, format: "{0:n4}", },
                    ],
                });
            } else {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show(
                    { message: "No records are found on this Opening Inventory." }, "warning");
            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        },
    });
}

function ShowNotification(message, messageType) {
    if (messageType = 'error') {
        $("#divMessage").removeClass("alert-success").addClass("alert-danger");
    }
    else {
        $("#divMessage").addClass("alert-success").removeClass("alert-danger");
    }
    $("#divMessage").text(message);
    $("#divMessage").show();

    setTimeout(function () {
        $("#divMessage").hide();
    }, 4000);
}

function ValidateFinalize() {
    

    var popupNotification = $("#Notification").data("kendoNotification");

    if ($("#ddlFCAction").val() == "") {
        //ShowNotification("Required fields are missing.", "error");
        popupNotification.show({ message: "Required fields are missing." }, "error");
        $("#lblFCAction").show();
        $("#ddlFCAction").addClass("input-validation-error");
        return false;
    }
    else {
        $("#lblFCAction").hide();
        $("#ddlFCAction").removeClass("input-validation-error");
    }

    if ($("#dvFCAssignedTo").is(":visible") && $("#FCAssignedTo").val() == "") {
        // ShowNotification("Required fields are missing.", "error");
        popupNotification.show({ message: "Required fields are missing." }, "error");
        $("#lblFCAssignedTo").show();
        $("#FCAssignedTo").addClass("input-validation-error");
        return false;
    }
    else {
        $("#lblFCAssignedTo").hide();
        $("#FCAssignedTo").removeClass("input-validation-error");
    }

    var actionNote = $("#txtFCActionNotes").val();
    let prd_type = $('#txtFCActionNotes').hasClass('prd_type');
    if (actionNote == "" && (!prd_type && $("#IsLegalUser").val() == "False")) {
        //ShowNotification("Required fields are missing.", "error");
        $("#lblFCActionNotes").show();
        $("#txtFCActionNotes").addClass("input-validation-error");
        popupNotification.show({ message: "Required fields are missing." }, "error");
        return false;
    }
    else {
        $("#lblFCActionNotes").hide();
        $("#txtFCActionNotes").removeClass("input-validation-error");
    }

    var cutOffDate = $("#dtRFICutOffDate").val();
    if ($("#dtRFICutOffDate").is(":visible") && cutOffDate == '') {
        $("#lblRFICutOffDate").show();
        popupNotification.show({ message: "Required fields are missing." }, "error");
        $("#dtRFICutOffDate").addClass("input-validation-error");
        return false;
    }
    else {
        $("#lblRFICutOffDate").hide();
        $("#dtRFICutOffDate").removeClass("input-validation-error");
    }
    var workItemID = $("#hdnWorkItemID").val();
    var workItemTypeID = $("#hdnWorkItemTypeIDs").val();
    var WorkflowActionId = $("#ddlFCAction option:selected").val();
    var workItemType = $("#hdnWorkItemTypeID").val();
    $.ajax({
        type: "GET",
        url: "/Process/ValidateFinalize",
        data: { "workItemId": workItemID, "workItemTypeId": workItemTypeID, "WorkflowActionId": WorkflowActionId, "workItemType": workItemType },
        success: function (data) {

            //$("#divValidationMessages").html('');
            $("#divValidationMessages").html(data);
            var isError = $("#hdnIsError").val();
            if ((isError)) { //&& (WorkflowActionId == 5 || WorkflowActionId == 1)

                $("#modalbtnContinue").hide();
                $("#divValidateFooterForOverwrite").show();

            }
            else {
                $("#divValidateFooter").show();
                $("#modalbtnContinue").show();

            }
            if (data != "") {

                //$("#divFormHeading").hide();
                $("#errormodal").modal('show');
                //$("#overrulingHistorySection").hide();
                return false;
            }
            else {

                $("#errormodal").modal('hide');
                //$("#overrulingHistorySection").show();
            }
        },
    });

}

function SubmitFinalize() {
    debugger;
    $("#ActionId").val($("#ddlFCAction option:selected").val());
    var actionId = $("#ddlFCAction option:selected").val();
    var selectedEmployeeId = $("#FCAssignedTo option:selected").val();
    var actionNote = $("#txtFCActionNotes").val();
    var workItemType = $("#hdnWorkItemTypeID").val();
    var workItemID = $("#hdnWorkItemID").val();
    var applicationId = $("#hdnApplicationId").val();
    var publicUserProfileId = $("#hdPublicUserProfileId").val();
    var workItemTypeID = $("#hdnWorkItemTypeIDs").val();
    var ddlFCAction = $("#ddlFCAction :selected").text();
    var fcassignedTo = $("#FCAssignedTo :selected").text();
    var workItemTypeID = $("#hdnWorkItemTypeIDs").val();
    var cutOffDate = $("#dtRFICutOffDate").val();
    var approvalDate = $("#dtRFIApprovalDate").val();

    var communicationSentDate = $("#dtCommunicationSentDate").val();
    var complaintNotified = $("#ddlComplaintNotified :selected").text();
    var notifyingAgentName = $("#txtNotifyingAgentName").val();
    var complaintActionNotes = $("#txtComplaintActionNotes").val();
    var modeOfCommunication = $("#txtModeOfCommunication").val();

    $("#hdnWorkItemStatus").val(ddlFCAction);
    var updateRequest = new Object();
    updateRequest.ActionNotes = actionNote;
    updateRequest.WorkitemType = workItemType;
    updateRequest.WorkitemID = workItemID;
    updateRequest.SelectedActionID = actionId;
    updateRequest.ActionDate = new Date().toLocaleString();
    updateRequest.strActionDate = new Date().toLocaleString();
    updateRequest.ApplicationId = applicationId;
    updateRequest.PublicUserProfileId = publicUserProfileId;
    updateRequest.AssignedToEmail = fcassignedTo;
    updateRequest.WorkitemTypeId = workItemTypeID;
    updateRequest.SelectedEmployeeId = selectedEmployeeId;
    updateRequest.CutOffDate = cutOffDate;
    updateRequest.ApprovalPRDate = approvalDate;

    updateRequest.CommunicationSentDate = communicationSentDate;
    if (complaintNotified != null && complaintNotified == 'Yes')
        complaintNotified = true;
    else
        complaintNotified = false;

    updateRequest.ComplaintNotified = complaintNotified;
    updateRequest.NotifyingAgentName = notifyingAgentName;
    updateRequest.ComplaintActionNotes = complaintActionNotes;
    updateRequest.ModeOfCommunication = modeOfCommunication;

    $.ajax({
        type: 'POST',
        url: "/Process/SaveFinalize",
        contentType: "application/json",
        data: JSON.stringify(updateRequest),
        success: function (data) {
            var popupNotification = $("#Notification").data("kendoNotification");
            if (data.result == true) {
                popupNotification.show({ message: "Your request has been completed successfully." }, "success");
                window.location = "/PrivateUser/PrivateUserDashboard#";
            }
            else {
                popupNotification.show({ message: "Your request is not completed." }, "error");
            }
        },
        error: function (objError) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        }
    });

}

function HideSections() {
    document.getElementById('principalbasicinfoSection').classList.add('hidden');
    document.getElementById('principalpersonalinfoSection').classList.add('hidden');
    document.getElementById('principalspousepageSection').classList.add('hidden');
    document.getElementById('principalspoucefelonyinfoSection').classList.add('hidden');
    document.getElementById('principalresidentpageSection').classList.add('hidden');
    document.getElementById('principalresidentialhistorySection').classList.add('hidden');
    document.getElementById('principalCancelinfoSection').classList.add('hidden');
    /*$(linkName).removeClass('hidden');*/
}

$(document).ready(function () {
    $(document).on('click', '#principalbasicinfoLink', function () {

        bindprincipalbasicinfodataForUpdatePrincipalAmmendment();

    });
    //CallForData("#principalpersonalinfoLink", "GetPrincipalPersonalInformation", "#principalpersonalinfoSection")
    ///* CallForData("#principalcharacteristicsinfoLink", "EntityAddressInformation", "#principalcharacteristicsinfoSection")*/
    //CallForData("#principalspousepageLink", "GetSpouse", "#principalspousepageSection")
    ///*SpouseInformation()*/
    //CallForData("#principalspoucefelonyinfoLink", "GetFelonyInformation", "#principalspoucefelonyinfoSection")
    ////CallForData("#principalFelonyinfoLink", "GetFelonyInformation", "#principalFelonyinfoSection")
    //CallForData("#principalresidentpageLink", "GetOtherResidents", "#principalresidentpageSection")
    //CallForData("#principalresidentialhistoryLink", "GetResidentialHistory2", "#principalresidentialhistorySection")
    ///* CallForData("#principalemployeehistoryLink", "GetEmploymentHistory", "#principalemployeehistorySection")*/
    //CallForData("#principalCancelinfoLink", "EntityAddressInformation", "#principalCancelinfoSection")

    $(document).on('click', '#principalpersonalinfoLink', function () {
        CallForData("#principalpersonalinfoLink", "GetPrincipalPersonalInformation", "#principalpersonalinfoSection");
    });

    $(document).on('click', '#principalspousepageLink', function () {
        CallForData("#principalspousepageLink", "GetSpouse", "#principalspousepageSection");
    });

    $(document).on('click', '#principalspoucefelonyinfoLink', function () {
        CallForData("#principalspoucefelonyinfoLink", "GetFelonyInformation", "#principalspoucefelonyinfoSection");
    });

    $(document).on('click', '#principalresidentpageLink', function () {
        CallForData("#principalresidentpageLink", "GetOtherResidents", "#principalresidentpageSection");
    });

    $(document).on('click', '#principalresidentialhistoryLink', function () {
        CallForData("#principalresidentialhistoryLink", "GetResidentialHistory2", "#principalresidentialhistorySection");
    });

    $(document).on('click', '#principalCancelinfoLink', function () {
        CallForData("#principalCancelinfoLink", "EntityAddressInformation", "#principalCancelinfoSection");
    });



    //$(document).on('click', '#principalpersonalinfoLink', function () {

    //    
    //    alert(8888888888);
    //   //CallForData("#principalpersonalinfoLink", "GetPrincipalPersonalInformation", "#principalpersonalinfoSection");
    //    oneEventRunning = true;
    //    var PersonID = $("#personOrBusinessID").val();
    //    alert(PersonID);
    //    var _divtoshowdata = "#principalbasicinfoSection";
    //    showloading();
    //    $.ajax({
    //        type: "GET",
    //        url: "/Licensing/" + "GetPrincipalPersonalInformation",
    //        data: { "PersonID": PersonID },
    //        success: function (data) {
    //            $(_divtoshowdata).show();
    //            $(_divtoshowdata).html(data);
    //            $(_divtoshowdata).removeClass('hidden');
    //            $('#principalpersonalinfoSection').addClass('hidden');
    //            hideloading();
    //        },
    //    });
    //});

    $(document).on('click', '#btnFCSubmit', function () {
        debugger;
        // return SubmitFinalize();
        var validationResult = ValidateFinalize();
        if (!validationResult)
            return false;

    });
    $(document).on('click', '#btnCloseDeficiency', function () {
        ChangStatus('closed');
    });

    $(document).on('click', '#btnReOpen', function () {
        ChangStatus('reopen');
    });

    $(document).on('click', '#btnReCall', function () {
        ChangStatus('recall');
    });

    $(document).on('click', '#btnDeficiencyBack', function () {

        deficiencyId = $("#WFRequestResponseTrail.DeficiencyID").val();
        DeficancyTrail(deficiencyId);
    });

    $(document).on('click', '#btn-History-Back', function () {
        $("#errorSection").show();
        $("#overRulingSection").hide();
    });

    $(document).on('click', '#btn-History', function () {
        var workItemID = $("#hdnWorkItemID").val();
        var workItemTypeID = $("#hdnWorkItemTypeIDs").val();

        $("#errorSection").hide();
        $("#overRulingSection").show();

        $.ajax({
            type: "GET",
            url: "/Process/GetOverRulingHistory?WorkitemID=" + workItemID + "&WorkitemTypeID=" + workItemTypeID,
            dataType: "json",
            success: function (result) {
                //Grid code
                $("#overrulingHistory").empty();
                $("#overrulingHistory").kendoGrid({
                    toolbar: ["excel"],
                    excel: {
                        fileName: "OverrulingHistory.xlsx",
                        allPages: true,
                    },
                    dataSource: {
                        data: result,
                        schema: {
                            model: {
                                fields: {
                                    WorkItemID: { type: "number" },
                                    WorkItemTypeID: { type: "number" },
                                    ID: { type: "number" },
                                    ItemID: { type: "number" },
                                    ValidationType: { type: "string" },
                                    ValidationMessage: { type: "string" },
                                    OverruledBy: { type: "string" },
                                    OverruledDate: { type: "string" },
                                }
                            }
                        },
                        pageSize: 5
                    },
                    scrollable: false,
                    sortable: true,
                    pageable:
                    {
                        pageSizes: [5, 10, 20],
                        numeric: true
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
                        { field: "WorkItemID", hidden: true },
                        { field: "WorkItemTypeID", hidden: true },
                        { field: "ID", hidden: true },
                        { field: "ItemID", title: "Item #", hidden: true },
                        { field: "ValidationType", title: "Validation Type", width: "25%" },
                        { field: "ValidationMessage", title: "Validation Message", width: "25%" },
                        { field: "OverruledBy", title: "Overruled By", width: "25%" },
                        { field: "OverruledDate", title: "Overruled Date", width: "25%", template: "#= kendo.toString(kendo.parseDate(OverruledDate, 'MM/dd/yyyy'),'MM/dd/yyyy') #" },
                    ]
                });
            },
        });
    });

    $(document).on('click', '#btnViewPreviousSubmission', function () {

        var actionText = $('#btnViewPreviousSubmission').text();
        var workItemType = $("#hdnWorkItemTypeID").val();
        var workItemID = $("#hdnWorkItemID").val();
        var workItemTypeID = $("#hdnWorkItemTypeIDs").val();
        var originalReportedId = $("#hdnOriginalReportedTotalId").val();
        var licenseTypeId = $("#hdnLicenseTypeID").val();
        var selectedLicenseId = $("#hdnLicenseID").val();
        var reportMonth = $("#hdnReportMonth").val();
        var reportYear = $("#hdnReportYear").val();
        var monthName = GetMonthName(reportMonth);

        if (actionText == "View Previous Submission") {
            monthName = '# ' + monthName + ' ' + reportYear;
            $("#divHeading").html(monthName);
            $('#btnViewPreviousSubmission').text("View Amendment");
            viewExistingReportData();
            viewOnlyReports(originalReportedId, licenseTypeId, selectedLicenseId);
            previewWebClosingInventoryRecords(selectedLicenseId, reportMonth, reportYear);
        }
        else {
            $('#btnViewPreviousSubmission').text("View Previous Submission");
            viewAmendmentReportData(workItemType, workItemID, workItemTypeID);
        }
    });
});

function AssociatedWorkitems() {
    $.ajax({
        type: "GET",
        url: "/Process/AssociatedWorkitems",
        success: function (data) {
            hideAllDivs("Menu_6");
            previewAssociatedWorkitems();
            $("#associatedWorkItemsPartialView").html(data);
        }
    });

}
//Deficiency Trail Start
function DeficancyTrail(deficiencyId) {

    var workItemID = $("#hdnWorkItemID").val();
    var workItemType = $("#hdnWorkItemTypeID").val();
    $.ajax({
        type: "GET",
        url: "/Process/GetRFIByDeficiencyId",
        data: { "DeficiencyId": deficiencyId, "WorkItemID": workItemID, "WorkItemType": workItemType },
        success: function (data) {
            previewdeficiancyTrail();
            $("#deficiancyTrailPartialView").html(data);
            //Grid code
            $("#deficiencyTrailHistoryResult").empty();
            $("#deficiencyTrailHistoryResult").kendoGrid({
                toolbar: ["excel"],
                excel: {
                    fileName: "Deficiencies Trail.xlsx",
                    allPages: true,
                },
                dataSource: {
                    data: jQuery.parseJSON(deficiencyTrailResult),
                    schema: {
                        model: {
                            fields: {
                                DeficiencyID: { type: "number" },
                                DeficiencyStatus: { type: "string" },
                                RequestText: { type: "string" },
                                ResponseText: { type: "string" },
                            }
                        }
                    },
                    pageSize: 5
                },
                scrollable: false,
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
                    { field: "DeficiencyID", title: "Deficinecy Id", hidden: "true" },
                    { field: "DeficiencyStatus", title: "Status", width: "10%" },
                    { field: "RequestText", title: "Request", width: "45%" },
                    { field: "ResponseText", title: "Response", width: "45%" },
                ]
            });
        },
    });
}

function ChangStatus(status) {
    var updateRequest = new Object();
    updateRequest.DeficiencyID = $("#WFRequestResponseTrail_DeficiencyID").val();
    updateRequest.DeficiencyHeadingId = $("#WFRequestResponseTrail_DeficiencyHeadingId").val();
    updateRequest.DeficiencyStatusCode = status;
    updateRequest.RequestText = $("#txtRequestText").val();

    if ($("#txtRequestText").val() == "") {
        ShowNotification("Required fields are missing.", "error");
        return false;
    }

    $.ajax({
        type: 'POST',
        url: "/Process/UpdateDeficiencyStatus",
        contentType: "application/json",
        data: JSON.stringify(updateRequest),
        success: function (data) {
            var popupNotification = $("#Notification").data("kendoNotification");
            if (data) {
                popupNotification.show({ message: "Your request has been completed successfully." }, "success");
                RenderMenuPartialView('Deficiency History');
            }
            else {
                popupNotification.show({ message: "Your request is not completed." }, "error");
            }
        },
        error: function (objError) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        }
    })

}

function onDataBound(e) {
    var grid = e.sender;
    var rows = grid.tbody.find("[role='row']");

    rows.unbind("click");
    rows.on("click", onClick)
};

function onClick(e) {
    var row = $(e.target).closest("tr");
    var status = row[0].cells[4].innerText;
    if (status != 'Draft') {
        DeficancyTrail(row[0].cells[1].innerText);

    }
};
//Deficiency Trail End

function previewBOPData() {

    var applicationId = $("#hdnApplicationId").val();
    $.ajax({
        type: "GET",
        url: "/SelfService/GetBreachOfPeaceInformation?BOPID=" + applicationId,
        success: function (data) {

            if (data != null) {

                hideAllPartialViews('bopPartialView');

                var dataElements = "";
                dataElements += getDataElement('BOP ID', data.BOPID, 'ion-pound');
                dataElements += getDataElement('Date Created', data.strCreatedDate, 'ion-calendar');
                dataElements += getDataElement('Incident Date', data.strIncidentDate, 'ion-calendar');
                dataElements += getDataElement('Injury', data.SeriousInjury ? 'Yes' : 'No', 'ion-refresh');
                dataElements += getDataElement('Source License', data.SourceLicense, 'ion-qr-scanner');
                var address = data.AddressLine1;
                if (data.AddressLine2 != null && data.AddressLine2 != "") {
                    address += ", " + data.AddressLine2;
                }
                address += "<br />" + data.City + " " + data.State + " " + data.ZipCode;

                if (data.Country != null && data.Country != "") address += "<br />" + data.Country;
                if (address == null || address == "") {
                    address = "None";
                }
                dataElements += getDataElement('Location', address, 'ion-map');
                dataElements += getDataElement('Is Authority Informed?', data.IsAuthorityInformed ? 'Yes' : 'No', 'ion-cube');
                dataElements += getDataElement('Agency Name', data.AgencyName, 'ion-cube');
                dataElements += getDataElement('Case ID', data.CaseID, 'ion-folder');
                dataElements += getDataElement('Agent Name', data.AgentName, 'ion-person');
                dataElements += getDataElement('Officer Contact Number', data.OfficerPhoneNumber, 'ion-person');
                dataElements += getDataElement('Officer Email', data.OfficerEmail, 'ion-person');
                dataElements += getDataElement('Acknowledgement', data.Acknowledgement, 'ion-ios7-paper-outline');
                dataElements += "<br />"
                dataElements += getDataHrefElement('License ID', data.LicenseID, 'ion-pound');
                dataElements += getDataElement('Trade Name', data.LicDBA, 'ion-pound');

                document.getElementById('bopData').innerHTML = dataElements;

                if (data.IsNDO) {
                    isNDOExists = true;
                    showNDO(true);

                    GetNDODetailsById(applicationId, 'BOP', 5);

                }
                else {
                    isNDOExists = false;
                    hideNDO();
                }


                previewBOPWitnessData(data.BOPID);
            }
            else {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "No information found on this record." }, "warning");
            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        },
    });
}

function backToBOPInfo() {
    document.getElementById('bop_view').classList.remove('hidden');
    document.getElementById('bop_edit_exp').classList.add('hidden');
    document.getElementById('bopWitness_edit_exp').classList.add('hidden');
    previewBOPData();
}

function getDataElementWithoutIcon(title, value) {
    return '<div class="form-group col-md-4">'
        + '<label class="control-label">' + title + '</label>'
        + '<div>' + value + '</div>'
        + '</div>';
}
/*
function editBOPInformation_Expungement() {
    document.getElementById('bop_view').classList.add('hidden');
    document.getElementById('bop_edit_exp').classList.remove('hidden');

    const applicationId = $("#hdnApplicationId").val();
    $.ajax({
        type: "GET",
        url: "/SelfService/GetBreachOfPeaceInformation?BOPID=" + applicationId,
        success: function (data) {
            if (data != null) {
                let dataElements = "";
                dataElements += getDataElementWithoutIcon('BOP ID', data.BOPID);
                dataElements += getDataElementWithoutIcon('Date Created', data.strCreatedDate);
                dataElements += getDataElementWithoutIcon('Incident Date', data.strIncidentDate);
                dataElements += getDataElementWithoutIcon('Injury', data.SeriousInjury ? 'Yes' : 'No');
                dataElements += getDataElementWithoutIcon('Source License', data.SourceLicense);
                var address = data.AddressLine1;
                if (data.AddressLine2 != null && data.AddressLine2 != "") {
                    address += ", " + data.AddressLine2;
                }
                address += "<br />" + data.City + " " + data.State + " " + data.ZipCode;

                if (data.Country != null && data.Country != "") address += "<br />" + data.Country;
                if (address == null || address == "") {
                    address = "None";
                }
                dataElements += getDataElementWithoutIcon('Location', address);
                dataElements += getDataElementWithoutIcon('Is Authority Informed?', data.IsAuthorityInformed ? 'Yes' : 'No');
                dataElements += getDataElementWithoutIcon('Agency Name', data.AgencyName);
                dataElements += getDataElementWithoutIcon('Case ID', data.CaseID);
                dataElements += getDataElementWithoutIcon('Agent Name', data.AgentName);
                dataElements += getDataElementWithoutIcon('License ID', data.LicenseID);
                dataElements += getDataElementWithoutIcon('Trade Name', data.LicDBA);

                document.getElementById('bopData_div_edit_exp').innerHTML = dataElements;
                document.getElementById('bop_acknoledgement').value = data.Acknowledgement;
                document.getElementById('bop_acknoledgementCounterEdit').innerHTML = 500 - data.Acknowledgement.length;
                //previewBOPWitnessData(data.BOPID);
            }
            else {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "No information found on this record." }, "warning");
            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        },
    });
}

function updateBOPInfo_Expungement() {
    const id = $("#hdnApplicationId").val();
    const notesInput = document.getElementById('bop_acknoledgement').value;

    let isError = false;
    var regex = /^[A-Za-z0-9,. ]+$/;
    if (notesInput != '' && (notesInput.replace(/\s+/g, '') == "" || !regex.test(notesInput))) {
        document.getElementById('err_bop_acknoledgement').classList.add('hidden');
        document.getElementById('formatErr_bop_acknoledgement').classList.remove('hidden');
        isError = true;
    } else {
        document.getElementById('err_bop_acknoledgement').classList.add('hidden');
        document.getElementById('formatErr_bop_acknoledgement').classList.add('hidden');
    }
    if (isError) return;

    const saveRequest = new Object();
    saveRequest.Id = id;
    saveRequest.Notes = notesInput;

    $.ajax({
        type: "POST",
        url: "/Enforcement/Expungement_SaveBOP",
        contentType: "application/json",
        data: JSON.stringify(saveRequest),
        success: function (data) {
            var popupNotification = $("#Notification").data("kendoNotification");
            if (data != null && data === true) {
                popupNotification.show({ message: "BOP information updated successfully." }, "success");
                backToBOPInfo();
            }
            else {
                popupNotification.show({ message: "Error updating BOP information." }, "error");
            }
        },
        error: function (objError) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went wrong. Please try again." }, "error");
        }
    });
}
*/
function previewBOPWitnessData(BOPID) {


    $("#witnessGrid").empty();

    $.ajax({
        type: "GET",
        url: "/SelfService/GetAllBOPWitnessInformation",
        data: { "BOPID": BOPID },
        success: function (results) {
            if (results.length != 0) {
                const expungementMode = isExpungementMode();
                $("#witnessGrid").kendoGrid({
                    dataSource: {
                        data: results,
                        schema: {
                            model: {
                                fields: {
                                    WitnessID: { type: "number" },
                                    WitnessFirstName: { type: "string" },
                                    WitnessLastName: { type: "string" },
                                    WitnessPhoneNumber: { type: "string" },
                                    WitnessEmail: { type: "string" },
                                    WitnessCity: { type: "string" },
                                    WitnessState: { type: "string" },
                                    CreatedBy: { type: "string" },
                                    CreatedDate: { type: "string" },
                                    strCreatedDate: { type: "string" }
                                }
                            }
                        },
                        pageSize: 5
                    },
                    scrollable: false,
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
                        { field: "WitnessID", title: "Work Item #", width: "15%", hidden: "true" },
                        { template: "#= WitnessFirstName # #= WitnessLastName #", title: "Name", width: "15%" },
                        { field: "WitnessPhoneNumber", title: "Phone", width: "15%" },
                        { field: "WitnessEmail", title: "Email", width: "15%" },
                        { field: "WitnessCity", title: "City", width: "15%" },
                        { field: "WitnessState", title: "State", width: "15%" },
                        //{
                        //    title: "Actions", width: 100, hidden: expungementMode !== true, template: function (dataItem) {
                        //        let actionTemplate = '';
                        //        let data = encodeURIComponent(JSON.stringify(dataItem));
                        //        actionTemplate += "<a role='button' href='javascript:void(0);' title='Edit' class='k-button k-button-icontext k-grid-edit' onclick='editBOPWitness_expungement(this)' data-item=\"" + data + "\"><span class='k-icon k-i-edit'></span> </a>&nbsp;&nbsp;";
                        //        actionTemplate += '<a role="button" class="k-button k-button-icontext k-grid-delete" href="javascript:void(0);" onclick="removeBOPWitness_expungement(' + dataItem.WitnessID + ')"><span class="k-icon k-i-close"></span> </a>';
                        //        return actionTemplate;
                        //    }
                        //}
                    ]
                });
            }
            else {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "No witness found on this record." }, "warning");
            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        },
    });
}
/*
function editBOPWitness_expungement(element) {
    document.getElementById('bop_view').classList.add('hidden');
    document.getElementById('bop_edit_exp').classList.add('hidden');
    document.getElementById('bopWitness_edit_exp').classList.remove('hidden');

    const dataItemJSON = $(element).attr('data-item');
    const data = JSON.parse(decodeURIComponent(dataItemJSON));
    document.getElementById('hdnBOPWitnessId_exp').value = data.WitnessID;
    document.getElementById('firstName_bop_witness_exp').value = data.WitnessFirstName;
    document.getElementById('lastName_bop_witness_exp').value = data.WitnessLastName;
    document.getElementById('phoneNumber_bop_witness_exp').value = data.WitnessPhoneNumber;
    document.getElementById('email_bop_witness_exp').value = data.WitnessEmail;

    let dataElements = "";
    dataElements += getDataElementWithoutIcon('City', data.WitnessCity);
    dataElements += getDataElementWithoutIcon('State', data.WitnessState);
    dataElements += getDataElementWithoutIcon('Added by', data.CreatedBy);
    dataElements += getDataElementWithoutIcon('Added on', data.strCreatedDate);
    document.getElementById('bopWitnessData_div_edit_exp').innerHTML = dataElements;
}


function updateBOPWitnessInfo_Expungement() {
    const id = $("#hdnBOPWitnessId_exp").val();
    const firstNameInput = document.getElementById('firstName_bop_witness_exp').value;
    const lastNameInput = document.getElementById('lastName_bop_witness_exp').value;
    const phoneNumberInput = document.getElementById('phoneNumber_bop_witness_exp').value;
    const emailInput = document.getElementById('email_bop_witness_exp').value;

    let isError = false;

    if (phoneNumberInput != '' && !isValidPhone(phoneNumberInput)) {
        document.getElementById('err_phoneNumber_bop_witness_exp').classList.remove('hidden');
        isError = true;
    } else {
        document.getElementById('err_phoneNumber_bop_witness_exp').classList.add('hidden');
    }

    if (emailInput != '' && !ValidateEmail(emailInput)) {
        document.getElementById('err_email_bop_witness_exp').classList.remove('hidden');
        isError = true;
    } else {
        document.getElementById('err_email_bop_witness_exp').classList.add('hidden');
    }
    if (isError) return;

    const saveRequest = new Object();
    saveRequest.Id = id;
    saveRequest.FirstName = firstNameInput;
    saveRequest.LastName = lastNameInput;
    saveRequest.PhoneNumber = phoneNumberInput;
    saveRequest.Email = emailInput;

    $.ajax({
        type: "POST",
        url: "/Enforcement/Expungement_SaveBOPWitness",
        contentType: "application/json",
        data: JSON.stringify(saveRequest),
        success: function (data) {
            var popupNotification = $("#Notification").data("kendoNotification");
            if (data != null && data === true) {
                popupNotification.show({ message: "BOP witness information updated successfully." }, "success");
                backToBOPInfo();
            }
            else {
                popupNotification.show({ message: "Error updating BOP witness information." }, "error");
            }
        },
        error: function (objError) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went wrong. Please try again." }, "error");
        }
    });
}

function removeBOPWitness_expungement(witnessId) {
    if (!confirm('Are you sure to delete this record?')) return;
    $.ajax({
        type: "DELETE",
        url: "/Enforcement/Expungement_DeleteBOPWitness?witnessId=" + witnessId,
        contentType: "application/json",
        success: function (data) {
            var popupNotification = $("#Notification").data("kendoNotification");
            if (data != null && data === true) {
                popupNotification.show({ message: "BOP witness deleted successfully." }, "success");
                backToBOPInfo();
            }
            else {
                popupNotification.show({ message: "Error deleting BOP witness." }, "error");
            }
        },
        error: function (objError) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went wrong. Please try again." }, "error");
        }
    });
}


*/
function previewComplaintData() {

    var applicationId = $("#hdnApplicationId").val();
    $.ajax({
        type: "GET",
        url: "/Enforcement/GetComplaintByID?ComplaintID=" + applicationId,
        success: function (data) {
            if (data != null) {

                hideAllPartialViews('complaintPartialView');

                //Complaint Details
                var dataElements = "";
                dataElements += getDataElement('Tracking ID', data.TrackingId, 'ion-pound');
                dataElements += getDataElement('Status', data.ComplaintStatus, 'ion-folder');
                dataElements += getDataElement('Source', data.ComplaintSource, 'ion-folder');


                dataElements += getDataElement('Submitted Date', data.strDateCreated, 'ion-calendar');
                // dataElements += getDataElement('Source', data.ComplaintSource, 'ion-folder');
                if (data.IsAnanomnus != null && data.IsAnanomnus != "" && data.IsAnanomnus != "false") {
                    dataElements += getDataElement('Is Anonymous', "Yes", 'ion-card');
                }
                else {
                    dataElements += getDataElement('Is Anonymous', "No", 'ion-card');
                }
                dataElements += getDataElement('Complaint Name', data.ComplainanName, 'ion-card');
                dataElements += getDataElement('Phone', data.ComplaintPhone, 'info-card-icon ion-ios7-telephone m-0 text-primary');
                dataElements += getDataElement('Email', data.ComplaintEmail, 'ion-email');
                if (data.IsAdult != null && data.IsAdult != "" && data.IsAdult != "false") {
                    dataElements += getDataElement('Is Adult', "Yes", 'ion-card');
                }
                else {
                    dataElements += getDataElement('Is Adult', "No", 'ion-card');
                }


                var dataTextElement = "";
                var Description = getDataTextElement('Description', data.ComplaintDescription, 'ion-document-text').replace("readonly", "rows='7', readonly");
                //var ExpectedResolution = getDataTextElement('Expected Resoultion', data.ExpectedResolution, 'ion-document-text').replace("readonly", "rows='4', readonly");
                dataTextElement += Description;
                // dataTextElement += ExpectedResolution;

                document.getElementById('complaintData').innerHTML = dataElements;
                document.getElementById('complaintTextData').innerHTML = dataTextElement;

                var licensedataTextElement = "";
                licensedataTextElement += getDataElement('Trade Name', data.LicenseBusinessName, 'ion-card');
                licensedataTextElement += getDataElement('License Number', data.LicenseId, 'ion-pound');
                licensedataTextElement += getDataElement('Application SubType', data.ApplicationSubType, 'ion-card');
                licensedataTextElement += getDataElement('Licensee Name', data.ApplicationName, 'ion-card');
                licensedataTextElement += getDataElement('License Status', data.ApplicationStatus, 'ion-refresh');
                licensedataTextElement += getDataElement('License Address', data.LicenseAddress, 'ion-location');
                licensedataTextElement += getDataElement('License Phone', data.LicensePhone, 'info-card-icon ion-ios7-telephone m-0 text-primary');
                var dataElements6 = "";
                if (data.Files != null && data.Files.length > 0) {
                    for (var attachedFileIndex = 0; attachedFileIndex < data.Files.length; attachedFileIndex++) {
                        var attachedDocument = " <div class='form - group font-16' id = 'ulCOMFile'><a href='/Licensing/DownloadFile?FileID=@FileID'>@FileName</a></div>";
                        //dataElements6 += Html.ActionLink(ViewBag.FileName, "DownloadFile", "Licensing", new { FileID = ViewBag.FileID }, null);
                        if ((data.Files[attachedFileIndex].FileId != null && data.Files[attachedFileIndex].FileId > 0) && (data.Files[attachedFileIndex].FileName != null && data.Files[attachedFileIndex].FileName != "")) {
                            dataElements6 += getDataElement('Attached Document', attachedDocument.replace("@FileID", data.Files[attachedFileIndex].EncriptedFileId).replace("@FileName", data.Files[attachedFileIndex].FileName), 'ion-card');
                            //dataElements6 += " <div class='form - group'><ul id = 'ulGHIFile'><li class='font-16'><a href='/Licensing/DownloadFile?FileID=20549'>ApplicationSummary.pdf</a></li></ul></div>";
                        }
                    }
                }
                else {
                    dataElements6 += getDataElement('Attached Document', 'No attached document found.', 'ion-card');
                    document.getElementById('complaintData1').innerHTML = "No attached document found.";
                }
                document.getElementById('complaintData1').innerHTML = dataElements6;
                document.getElementById('LicenseData').innerHTML = licensedataTextElement;
                if (data.IsAnanomnus != true) {

                    //Complainant Details-----------------------------
                    var dataElements3 = "";
                    dataElements3 += getDataElement('First Name', data.FirstName, 'ion-pound');
                    dataElements3 += getDataElement('Last Name', data.LastName, 'ion-folder');

                    if (data.IsAdult != null && data.IsAdult != "" && data.IsAdult != "false") {
                        dataElements3 += getDataElement('Is Older than 18?', "Yes", 'ion-card');
                    }
                    else {
                        dataElements3 += getDataElement('Is Older than 18?', "No", 'ion-card');
                    }
                    dataElements3 += getDataElement('Email', data.ComplaintEmail, 'ion-email');
                    dataElements3 += getDataElement('Phone', data.ComplaintPhone, 'info-card-icon ion-ios7-telephone m-0 text-primary');
                    if (data.IsComplainantWantStatusUpdates != null && data.IsComplainantWantStatusUpdates != "" && data.IsComplainantWantStatusUpdates != "false") {
                        dataElements3 += getDataElement('Complainant Want To Receive Updates', "Yes", 'ion-card');
                    }
                    else {
                        dataElements3 += getDataElement('Complainant Want To Receive Updates', "No", 'ion-card');
                    }
                }
                else {
                    dataElements3 = 'Complainant requested to be anonymous.';
                }
                document.getElementById('complaintData3').innerHTML = dataElements3;

                //---------
                //--------
                var dataTextElement5 = "";
                var Description5 = getDataTextElement('Action Notes', data.ComplaintActionNotes, 'ion-document-text').replace("readonly", "rows='7', readonly");
                dataTextElement5 += Description5;

                //Resolution-----------------------------
                var dataElements5 = "";
                if (data.ComplaintNotified != null && data.ComplaintNotified != "" && data.ComplaintNotified != "false") {
                    dataElements5 += getDataElement('Complainant Notified', "Yes", 'ion-card');
                }
                else {
                    dataElements5 += getDataElement('Complainant Notified', "No", 'ion-card');
                }
                dataElements5 += getDataElement('Notifying Agent Name', data.NotifyingAgentName, 'ion-folder');
                dataElements5 += getDataElement('Mode of Communication', data.ModeOfCommunication, 'ion-calendar');
                dataElements5 += getDataElement('Content of Update', "HyperLink", 'ion-email');
                dataElements5 += getDataElement('Communication Sent Date', data.CommunicationSentDate, 'info-card-icon ion-ios7-telephone m-0 text-primary');

                //updateRequest.CommunicationSentDate = communicationSentDate;
                //updateRequest.ComplaintNotified = complaintNotified;
                //updateRequest.NotifyingAgentName = notifyingAgentName;
                //updateRequest.ComplaintActionNotes = complaintActionNotes;
                //updateRequest.ModeOfCommunication = modeOfCommunication;
                if (data.ComplaintStatus == "Closed") {
                    document.getElementById('divResolution').classList.remove('hidden');
                    document.getElementById('complaintTextData5').innerHTML = dataTextElement5;
                    document.getElementById('complaintData5').innerHTML = dataElements5;
                } else if (data.ComplaintStatus == "Open") {
                    document.getElementById('divResolution').classList.add('hidden');
                }


                //-----


                if (data.ComplaintDescription == "Protest") {
                    $("#protestSection").show();
                    if (document.getElementById("comSectionHeader")) {
                        document.getElementById("comSectionHeader").innerHTML = "Protestee Details";
                    }
                    document.getElementById("comDetailSectionHeader").innerHTML = "Protest Details";

                    var protestDataTextElement = "";

                    if (data.IsProtestorGovOfficial != null) {
                        if (data.IsProtestorGovOfficial) {
                            protestDataTextElement += getDataElement('Is Government Official?', "Yes", 'ion-card');

                            if (data.GovOfficialTitle != "" && data.GovOfficialTitle != null)
                                protestDataTextElement += getDataElement('Title of elected or appointed position.', data.GovOfficialTitle, 'ion-card');

                            if (data.ProtestGeoBoundJurisdiction != "" && data.ProtestGeoBoundJurisdiction != null)
                                protestDataTextElement += getDataElement('Geographic boundries of jurisdriction.', data.ProtestGeoBoundJurisdiction, 'ion-card');
                        }
                        else {
                            protestDataTextElement += getDataElement('Is Government Official?', "No", 'ion-card');
                        }
                    }
                    else {
                        protestDataTextElement += getDataElement('Is Government Official?', "N/A", 'ion-card');
                    }

                    if (data.IsLicenseSexuallyOrientedBusiness != null) {
                        if (data.IsLicenseSexuallyOrientedBusiness)
                            protestDataTextElement += getDataElement('Is sexually oriented business?', "Yes", 'ion-card');
                        else {
                            protestDataTextElement += getDataElement('Is sexually oriented business?', "No", 'ion-card');
                        }
                    }
                    else {
                        protestDataTextElement += getDataElement('Is sexually oriented business ?', "N/A", 'ion-card');
                    }

                    if (data.ProtastantDistanceFromLocation != null) {
                        protestDataTextElement += getDataElement('distance (in feet) of the protestant’s physical address from the location.', (data.ProtastantDistanceFromLocation).toLocaleString(), 'ion-card');
                    }
                    else {
                        protestDataTextElement += getDataElement('distance (in feet) of the protestant’s physical address from the location.', "N/A", 'ion-card');
                    }

                    if (data.IsProtestOnNewLicense != null) {
                        if (data.IsProtestOnNewLicense)
                            protestDataTextElement += getDataElement('Is this a new or existing business?', "Yes", 'ion-card');
                        else {
                            protestDataTextElement += getDataElement('Is this a new or existing business?', "No", 'ion-card');
                        }
                    }
                    else {
                        protestDataTextElement += getDataElement('Is this a new or existing business?', "N/A", 'ion-card');
                    }

                    if (data.IsGFPIllegalSales != null) {
                        if (data.IsGFPIllegalSales)
                            protestDataTextElement += getDataElement('Illegal sales of alcohol have occured at this business or location.', "Yes", 'ion-card');
                        else {
                            protestDataTextElement += getDataElement('Illegal sales of alcohol have occured at this business or location.', "No", 'ion-card');
                        }
                    }
                    else {
                        protestDataTextElement += getDataElement('Illegal sales of alcohol have occured at this business or location.', "N/A", 'ion-card');
                    }

                    if (data.IsGFPCriminalActivity != null) {
                        if (data.IsGFPCriminalActivity)
                            protestDataTextElement += getDataElement('Criminal activity occurs or has occured at this business or location.', "Yes", 'ion-card');
                        else {
                            protestDataTextElement += getDataElement('Criminal activity occurs or has occured at this business or location.', "No", 'ion-card');
                        }
                    }
                    else {
                        protestDataTextElement += getDataElement('Criminal activity occurs or has occured at this business or location.', "N/A", 'ion-card');
                    }

                    if (data.IsGFPLocalLawViolation != null) {
                        if (data.IsGFPLocalLawViolation)
                            protestDataTextElement += getDataElement('The proposed location would violate a local regulation prohibiting the sale of alcoholic beverages within a certain distance of a church, school, or hospital.', "Yes", 'ion-card');
                        else {
                            protestDataTextElement += getDataElement('The proposed location would violate a local regulation prohibiting the sale of alcoholic beverages within a certain distance of a church, school, or hospital.', "No", 'ion-card');
                        }
                    }
                    else {
                        protestDataTextElement += getDataElement('The proposed location would violate a local regulation prohibiting the sale of alcoholic beverages within a certain distance of a church, school, or hospital.', "N/A", 'ion-card');
                    }

                    if (data.IsGFPOther != null) {
                        if (data.IsGFPOther) {
                            if (data.GFPOtherDescription != "")
                                protestDataTextElement += getDataElement('Other', data.GFPOtherDescription, 'ion-card');
                            else
                                protestDataTextElement += getDataElement('Other', "N/A", 'ion-card');
                        }
                        else {
                            protestDataTextElement += getDataElement('Other', "No", 'ion-card');
                        }
                    }
                    else {
                        protestDataTextElement += getDataElement('Other', "N/A", 'ion-card');
                    }

                    document.getElementById('protestData').innerHTML = protestDataTextElement;
                }
                else {
                    $("#protestSection").hide();
                }
                //indComplaintEditData(data);
                var isExpUser = false;
                if (isExpungementMode()) {
                    //document.getElementById('hdnComplaintInfo_edit_data').value = encodeURIComponent(JSON.stringify(data));
                    $("#ddlProtestActions").show();
                    //fn_get_Protest_NonDisclosureOrder();
                    isExpUser = true;
                }
                else {
                    $("#ddlProtestActions").hide();
                    //fn_get_Protest_NonDisclosureOrder();
                    isExpUser = false;
                }
                fn_get_Protest_NonDisclosureOrder(isExpUser);

                if (data.IsNDO) {
                    isNDOExists = true;
                    showNDO(true);
                    if (data.ComplaintDescription == "Protest")
                        GetNDODetailsById(applicationId, 'PRT', 4);
                    else
                        GetNDODetailsById(applicationId, 'COM', 3);
                }
                else {
                    isNDOExists = false;
                    hideNDO();
                }


            }
            else {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "No information found on this record." }, "warning");
            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        },
    });
}

function previewComplianceReportingData() {

    var applicationId = $("#hdnApplicationId").val();
    $.ajax({
        type: "GET",
        url: "/Process/GetSubmittedComplianceReportById?submissionID=" + applicationId,
        success: function (data) {
            if (data != null) {
                hideAllPartialViews('complianceReportingPartialView');
                var dalaElement = '';
                if (data.length > 0) {
                    $("#hLicenseType").text(data[0].LicenseType);
                    $("#hLicenseID").text(data[0].LicenseId);
                    $("#hReportingPeriod").text(data[0].FiscalYear);
                    $("#hSubmittedDate").text(data[0].StrSubmittedDate);
                    //$("#divHeading").html("Compliance Reporting >> " + data[0].StatusDiscription);
                }
                for (i = 0; i <= data.length - 1; i++) {
                    dalaElement += getDataElementCR(data[i].QuestionCode, data[i].Question, data[i].ResponseText, data[i].FileID, data[i].FileName, data[i].IsResponseFlaged, data[i].FlagType, data[i].EncriptedFileId);
                    if (data[i].FileID > 0) {
                        var controlId = 'limg' + data[i].FileID;
                        var mapControlId = 'divMap' + data[i].FileID;
                        var licenseLat = data[i].LicenseLatitude;
                        var licenseLong = data[i].LicenseLongitude;
                        var locationLat = data[i].LocationLatitude;
                        var locationLong = data[i].LocationLongitude;
                        var locationAddress = data[i].LocationAddress;
                        var licenseAddress = data[i].LicenseAddress;
                        displayQuestionImages(data[i].FileID, controlId, licenseLat, licenseLong, locationLat, locationLong, locationAddress, licenseAddress);
                    }
                }
                document.getElementById('divQuestion').innerHTML = dalaElement;
            }
            else {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "No information found!" }, "warning");
            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        },
    });
}

function previewDemandFundRequestData() {

    var requestId = $("#hdnApplicationId").val();
    $.ajax({
        type: "GET",
        url: "/MoneyManagement/GetDemandFundMasterByRequestId?requestId=" + requestId,
        success: function (data) {
            if (data != null) {
                hideAllPartialViews('demandFundRequestPartialView');
                var dalaElement = '';
                dalaElement += getDataElement('Request ID', requestId, 'ion-pound');
                dalaElement += getDataElement('License Number', data.LisenceNumber, 'ion-pound');
                dalaElement += getDataElement('Payment Status', data.PaymentStatus, 'ion-refresh');
                dalaElement += getDataElement('Licensee Name', data.LicenseeName, 'ion-folder');
                dalaElement += getDataElement('Total Amount', data.TotalAmount, 'ion-social-usd');
                dalaElement += getDueDateElement('Due Date', data.strDueDate, 'ion-ios7-calendar', data.PaymentStatus);
                dalaElement += getDataElement('Reason Type', data.ReasonType, 'ion-folder');
                dalaElement += getDataElement12Column('Notes', data.Notes, 'ion-ios7-paper-outline');

                document.getElementById('divDemandFundRequest').innerHTML = dalaElement;

                var todayDate = kendo.toString(kendo.parseDate(new Date()), 'MM/dd/yyyy');
                $("#dueDatePicker").kendoDatePicker({
                    dateInput: true,
                    format: "MM/dd/yyyy",
                    min: todayDate,
                    change: function () {
                        var dueDateVal = kendo.toString(kendo.parseDate(new Date(this.value())), 'MM/dd/yyyy');
                        if (checkdate(dueDateVal) == false) {
                            document.getElementById("err_DueDateMandatory").classList.remove('hidden');
                        } else {
                            document.getElementById("err_DueDateMandatory").classList.add('hidden');
                        }
                    }
                });
                $("#btnDueDateUpdate").kendoButton({
                    themeColor: "primary",
                    size: "small"
                });
                $("#btnDueDateCancel").kendoButton({ size: "small" });
                document.getElementById("err_DueDateMandatory").classList.add('hidden');
                $("#divDueDate").hide();
                $("#btnsDueDate").hide();
                $("#dueDateText").show();
            }
            else {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "No information found!" }, "warning");
            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        },
    });
}

function displayQuestionImages(fileId, uiControllId, licenseLat, licenseLong, locationLat, locationLong, locationAddress, licenseAddress) {
    var imageIds = fileId;
    $.ajax({
        type: 'GET',
        url: "/ComplianceReporting/DisplayQuestionImages",
        data: { "ImageIDs": imageIds },
        cache: false,
        success: function (result) {
            jQuery.each(result, function (i, val) {

                //For Image
                var img = document.createElement('img');
                $(img).attr('alt', 'Forest');
                $(img).attr('style', 'height: 200px;width: 200px');
                $(img).attr('class', 'imgCompliance');
                img.src = val;

                var divMap = '', divMapMsg = '', divAddress = '';
                //For Map text
                divMapMsg = document.createElement('div');
                $(divMapMsg).attr('id', 'msg');
                $(divMapMsg).attr('style', 'margin-left:10px');

                //For Address text
                if (locationAddress != "") {
                    divAddress = document.createElement('div');
                    $(divAddress).attr('id', 'addresses');
                    $(divAddress).attr('class', 'imgCompliance');
                    $(divAddress).attr('style', 'height: 200px;width: 300px;margin-left:10px');
                    $(divAddress)[0].innerHTML = '<b>License Location:<br>' + licenseAddress + '<br><br>Picture Taken Address:<br>' + locationAddress + '</b>';
                }

                if (licenseLat != '' && licenseLong != '' && locationLat != '' && locationLong != '') {
                    //For Map
                    divMap = document.createElement('div');
                    $(divMap).attr('id', 'map');
                    $(divMap).attr('style', 'height: 200px;width: 500px;margin-left:10px');
                    $(divMap).attr('class', 'imgCompliance');
                }

                //For Thum
                var anchore = document.createElement('a');
                $(anchore).attr('target', '_blank');
                //$(anchore).attr('href', val);
                var aId = 'imgDiv' + i;
                anchore.id = aId;
                anchore.appendChild(img);
                document.getElementById(uiControllId).appendChild(anchore);

                if (divMap != '') {
                    document.getElementById(uiControllId).appendChild(divMap);
                    document.getElementById(uiControllId).appendChild(divAddress);
                    document.getElementById(uiControllId).appendChild(divMapMsg);
                    initMap(licenseLat, licenseLong, locationLat, locationLong, divMap, divMapMsg);
                }
                else {
                    if (locationAddress != "") {
                        document.getElementById(uiControllId).appendChild(divAddress);
                    }
                    document.getElementById(uiControllId).appendChild(divMapMsg);
                    $(divMapMsg)[0].innerHTML = "Unable to load google map of License location!!";
                }
            });
        },
        complete: function (result) {
            $("#divImageLoader" + fileId).hide();
        }
    });
}

function getDataElementCR(questionCode, questionTile, questionValue, fileId, fileName, isResponseFlaged, flagType, encrptedFileId) {
    var fileDownloadURL = '', imageLoader = '';
    if (fileId > 0) {
        fileDownloadURL = generatePictureFilesCR(fileId, fileName, encrptedFileId);
        imageLoader = "<div class='spinner-border text-primary' role='status' id='divImageLoader" + fileId + "'><span class='sr-only'>Loading...</span></div>";
    }
    if (isResponseFlaged == true) {
        return (
            "<div class='form - row'>" +
            "<div class='col - lg - 12 col - sm - 12'>" +
            "<div class='callout callout-danger'>" +
            "<h4'>Q " +
            questionCode + ' - ' + questionTile +
            "</h4><br>" +
            questionValue +
            fileDownloadURL +
            "<p id='limg" + fileId + "' class='form-row'></p>" +
            imageLoader +
            "<div class='ribbon red'><span>" + flagType + "</span></div></div>" +
            "</div>" +
            "</div>" +
            "</div>"
        );
    }
    else {
        return (
            "<div class='form - row'>" +
            "<div class='col - lg - 12 col - sm - 12'>" +
            "<div class='callout callout-primary'>" +
            "<h4'>Q " +
            questionCode + ' - ' + questionTile +
            "</h4><br>" +
            questionValue +
            fileDownloadURL +
            "<p id='limg" + fileId + "' class='form-row'></p>" +
            imageLoader +
            "</div>" +
            "</div>" +
            "</div>"
        );
    }
}

function generatePictureFilesCR(fileId, fileName, encrptedFileId) {

    var fileUrls = "<a href='/ComplianceReporting/DownloadFile?FileID=" + encrptedFileId + "' target='_blank' style='margin-left: 30px'>Download</a>";

    return fileUrls;
}

function previewDARData() {
    var applicationId = $("#hdnApplicationId").val();
    $.ajax({
        type: "GET",
        url: "/Enforcement/GetDARById?DARId=" + applicationId,
        dataType: "json",
        success: function (data) {
            if (data != null) {
                hideAllPartialViews('dailyActivityReportPartialView');

                var dataElements = "";
                dataElements += getDataElement('Submitting agent', data.RequestedBy, 'ion-refresh');
                dataElements += getDataElement('DAR Submission date', new Date(parseInt(data.RequestedDate.substr(6))).toLocaleDateString('en-US'), 'ion-refresh');
                dataElements += getDataElement('Total Hours', data.TotalHours, 'ion-refresh');
                dataElements += getDataElement('Status', data.Status, 'ion-folder');
                dataElements += getDataElement('Task Count', data.TaskCount, 'ion-refresh');

                document.getElementById('darData').innerHTML = dataElements;

                $.ajax({
                    type: "GET",
                    url: "/Enforcement/GetDARassociatedTasks?DARId=" + applicationId,
                    dataType: "json",
                    success: function (results) {
                        if (results != null && results.length > 0) {
                            $("#tasksGrid").empty();
                            $("#tasksGrid").kendoGrid({
                                dataSource: {
                                    data: results,
                                    schema: {
                                        model: {
                                            fields: {
                                                TaskId: { type: "number" },
                                                ActivityClassName: { type: "string" },
                                                ActivityName: { type: "string" },
                                                ActivityType: { type: "string" },
                                                ActivityDate: { type: "date" },
                                                ActivityStartTime: { type: "date" },
                                                Duration: { type: "number" },
                                                DARNotes: { type: "string" },
                                                InvestigationId: { type: "number" },
                                                GrantCodeName: { type: "string" },
                                                GrantMiles: { type: "number" },
                                            }
                                        }
                                    },
                                    pageSize: 5
                                },
                                scrollable: false,
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
                                    { field: "TaskId", title: "Task ID", width: "10%" },
                                    { field: "ActivityClassName", title: "Class", width: "25%" },
                                    { field: "ActivityName", title: "Activity", width: "25%" },
                                    { field: "ActivityDate", title: "Date", width: "20%", format: "{0:MM/dd/yyyy}" },
                                    { field: "ActivityStartTime", title: "Start Time", width: "15%", format: "{0:hh:mm tt}" },
                                    { field: "Duration", title: "Duration", width: "150px", hidden: "true" },
                                    //{ field: "DARNotes", title: "Notes", width: "20%" },
                                    { field: "InvestigationId", title: "Investigation", width: "100px", hidden: "true" },
                                    { field: "GrantCodeName", title: "GC", width: "150px", hidden: "true" },
                                    { field: "GrantMiles", title: "Grant Miles", width: "100px", hidden: "true" }
                                ]
                            });
                        } else {
                            var popupNotification = $("#Notification").data("kendoNotification");
                            popupNotification.show({ message: "No tasks found on the activity." }, "warning");
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

function previewAdminPenaltyData() {

    var applicationId = $("#hdnApplicationId").val();
    $.ajax({
        type: "GET",
        url: "/Enforcement/GetDispositionAdminPenaltyById?adminPenaltyId=" + applicationId,
        dataType: "json",
        success: function (data) {
            hideAllPartialViews('dispositionAdminPenaltyPartialView');

            if (data != null) {
                var dataElements = "";
                dataElements += getDataElement('Admin Penalty Id', data.AdminPenaltyId, 'ion-pound');
                dataElements += getDataElement('Penalty Type', data.PenaltyType, 'ion-calendar');
                /* dataElements += getDataElement('Written Notice Number', data.WrittenNoticeNumber, 'ion-folder');*/
                if (data.MonetaryAmount > 0)
                    dataElements += getDataElement('Monetary Amount', data.MonetaryAmount, 'ion-person');
                if (data.SuspensionDays > 0)
                    dataElements += getDataElement('Suspension Days', data.SuspensionDays, 'ion-stats-bars');
                if (data.SuspensionStart != null)
                    dataElements += getDataElement('Suspension Start', data.SuspensionStart != "" ? new Date(parseInt(data.SuspensionStart.substr(6))).toLocaleDateString('en-US') : 'None', 'ion-cube');
                dataElements += getDataElement('Status', data.ResponseStatus, 'ion-refresh');
                dataElements += getDataElement('Due', new Date(parseInt(data.ResponseDue.substr(6))).toLocaleDateString('en-US'), 'ion-ios7-paper-outline');
                dataElements += getDataElement('Follow Up', new Date(parseInt(data.ResponseFollowUp.substr(6))).toLocaleDateString('en-US'), 'ion-ios7-paper-outline');

                document.getElementById('penaltyData').innerHTML = dataElements;

                if (data.Violations != null && data.Violations.length > 0) {
                    $("#adminPnyViolations").empty();
                    $("#adminPnyViolations").kendoGrid({
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
                                        ViolationType: { type: "string" },
                                        ViolationDate: { type: "date" },
                                        Note: { type: "string" },
                                        CreatedBy: { type: "string" },
                                    }
                                }
                            },
                            pageSize: 10
                        },
                        groupable: true,
                        scrollable: false,
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
                            { field: "ViolationId", title: "Violation", width: "35%", hidden: "true" },
                            { field: "ViolationType", title: "Violation", width: "35%" },
                            { field: "ViolationDate", title: "Date", width: "15%", format: "{0:MM/dd/yyyy}" },
                            { field: "Note", title: "Note", width: "35%" },
                            { field: "CreatedBy", title: "Added by", width: "15%", }
                        ]
                    });
                }
                else {
                    var popupNotification = $("#Notification").data("kendoNotification");
                    popupNotification.show({ message: "No admin penalties found on this disposition." }, "warning");
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

function previewLegalApplicationTransactionData() {
    var applicationId = $("#hdnApplicationId").val();
    $.ajax({
        type: "GET",
        url: "/Enforcement/GetLegalInformationById?Id=" + applicationId,
        dataType: "json",
        success: function (data) {
            hideAllPartialViews('legalApplicationTransactionPartialView');

            if (data != null) {
                var dataElements = "";
                dataElements += getDataElement('Application Id', data.LegalInfomationDetailId, 'ion-pound');
                dataElements += getDataHrefElement('License Id', data.LicenseId, 'ion-pound');
                dataElements += getDataElement('Investigation Id', data.InvestigationId, 'ion-pound');
                dataElements += getDataElement('License DBA', data.LicenseDBA, 'ion-folder');
                dataElements += getDataElement('Reason', data.Objective, 'ion-folder');
                dataElements += getDataElement('Request Action', data.RequestedActionName, 'ion-folder');
                //dataElements += getDataElement('Investigator', data.InvestigatingCPO, 'ion-refresh');
                dataElements += getDataElement('Admin Penalty Id', data.AdminPenaltyId, 'ion-pound');
                dataElements += getDataElement('Disposition Id', data.DispositionRecommendationId, 'ion-pound');

                document.getElementById('legalData').innerHTML = dataElements;

                if (data.Violations != null && data.Violations.length > 0) {
                    $("#legalViolations").empty();
                    $("#legalViolations").kendoGrid({
                        toolbar: ["excel"],
                        excel: {
                            fileName: "LegalViolations.xlsx",
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
                                        Note: { type: "string" },
                                        CreatedBy: { type: "string" },
                                    }
                                }
                            },
                            pageSize: 10
                        },
                        groupable: true,
                        scrollable: false,
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
                            { field: "ViolationId", title: "Violation", width: "35%", hidden: "true" },
                            { field: "ViolationSubType", title: "Violation", width: "35%" },
                            { field: "ViolationDate", title: "Date", width: "15%", format: "{0:MM/dd/yyyy}" },
                            { field: "Note", title: "Note", width: "35%" },
                            { field: "CreatedBy", title: "Added by", width: "15%", }
                        ]
                    });
                }
                else {
                    var popupNotification = $("#Notification").data("kendoNotification");
                    popupNotification.show({ message: "No violations found on this workitem." }, "warning");
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

function getDataHrefElement(title, value, className) {
    return (
        "<div class='col-lg-4 col-sm-4'>" +
        "<div class='media mt-3'>" +
        "<div class='mr-2 align-self-center'>" +
        "<i class='info-card-icon " + className + " m-0 text-primary'></i>" +
        "</div>" +
        "<div class='media-body overflow-auto'>" +
        "<p class='mb-1'>" + title + "</p>" +
        "<h5 class='info-card-h5 mt-0 value'><a id='link' class='stretched-link' onclick='viewLicenseInformation(" + value + ")'>" + (value == '' ? 'No Data' : value) + "</a></h5>" +
        "</div>" +
        "</div>" +
        "</div>");
}

function viewLicenseInformation(licenseID) {
    var backURL = window.location.href;
    var workItemType = $("#hdnWorkItemTypeID").val();
    $.ajax({
        type: "GET",
        url: "/Licensing/GetPublicUserLicenseInformation",
        data: { "LicenseID": licenseID, "WorkItemType": workItemType, "BackURL": backURL },
        success: function (data) {
            hideAllPartialViews('licenseInformationPartialView');
            $("#licenseInformationPartialView").html(data);
        },
    });
}

function onEditDueDate() {
    var dueDate = document.getElementById("dueDateText").innerHTML;
    document.getElementById("err_DueDateMandatory").classList.add('hidden');
    $("#dueDateText").hide();
    $("#dueDatePicker").val(dueDate);
    $("#divDueDate").show();
    $("#btnsDueDate").show();
}

function onCancelDueDate() {
    $("#divDueDate").hide();
    $("#dueDateText").show();
    $("#btnsDueDate").hide();
}

function onUpdateDueDate() {
    var dueDate = $("#dueDatePicker").val();
    var requestId = $("#hdnApplicationId").val();

    if (dueDate && (dueDate != "" || dueDate != null)) {
        var formatedDueDate = kendo.toString(dueDate, 'MM/dd/yyyy');
        if (checkdate(formatedDueDate) == false) {
            document.getElementById("err_DueDateMandatory").classList.remove('hidden');
            return;
        }
        document.getElementById("err_DueDateMandatory").classList.add('hidden');
        var request = {
            "DFRRequestId": requestId,
            "NewDueDate": formatedDueDate
        };
        //ajax to update the duedate
        $.ajax({
            type: "POST",
            url: "/Process/UpdateDFDueDate",
            contentType: "application/json",
            data: JSON.stringify(request),
            success: function (data) {
                $("#divDueDate").hide();
                $("#dueDateText").text(dueDate);
                $("#dueDateText").show();
                $("#btnsDueDate").hide();
            },
            error: function (objError) {
            }
        });
    } else {
        // display an error label
        document.getElementById("err_DueDateMandatory").classList.remove('hidden');
        return;
    }
}

function getDueDateElement(title, value, className, isPaymentDone) {
    var dueDateStr = "";
    if (isPaymentDone && isPaymentDone.toLowerCase() != "paid") {
        dueDateStr = "<i class='icon ion-compose ml-1' style='color:blue; font-size:24px' onclick='onEditDueDate()'></i></p>";
    }

    return (
        "<div class='col-lg-4 col-sm-4'>" +
        "<div class='media mt-3'>" +
        "<div class='mr-2 align-self-center'>" +
        "<i class='info-card-icon " + className + " m-0 text-primary'></i>" +
        "</div>" +
        "<div class='media-body overflow-auto'>" +
        "<p class='mb-1'>" + title + dueDateStr +
        "<h5 id='dueDateText' class='info-card-h5 mt-0 value'>" + (value == '' ? 'No Data' : value) + "</h5>" +
        "<div id='divDueDate'>" +
        "<input id='dueDatePicker'/>" +
        "<label id='err_DueDateMandatory' class='text-danger field-validation-error hidden'>Please Select Valid Due Date</label>" +
        "</div>" +
        "<div id='btnsDueDate' class='mt-1'>" +
        "<button class='btn btn-primary k-primary' id='btnDueDateUpdate' onclick='onUpdateDueDate()'>Update</button>" +
        "<button class='btn btn-secondary' id='btnDueDateCancel' onclick='onCancelDueDate()'>Cancel</button>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>");
}

function getDataElementHeaderOnly(header) {
    return (
        "<div class='col-lg-12 col-sm-12'>"
        + "<div class='media mt-3'>"
        + "<div class='media-body overflow-auto'>"
        + "<h5 class='mb-1'>"
        + header
        + "</h5>"
        + "</div>"
        + "</div>"
        + "</div>"
    );
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

function getDataTextElement(title, value, className) {
    return (
        "<div class='col-12'>" +
        "<div class='media mt-3'>" +
        "<div class='mr-2 align-self-center'>" +
        //"<i class='info-card-icon " + className + " m-0 text-primary'></i>" +
        "</div>" +
        "<div class='media-body overflow-auto'>" +
        "<p class='mb-1'>" + title + "</p>" +
        "<textarea class='k-textbox width100perc sero-input:focus' readonly>" + (value == '' ? 'No Data' : value) + "</textarea>" +
        "</div>" +
        "</div>" +
        "</div>");
}

function renderLicenseInformation(licenseId) {
    var workItemTypeId = $("#hdnWorkItemTypeIDs").val();
    var workItemID = $("#hdnWorkItemID").val();
    $.ajax({
        type: "GET",
        url: "/Process/LicenseInformation",
        data: {
            "WorkitemTypeID": workItemTypeId, "WorkitemID": workItemID, "licenseId": licenseId
        },
        success: function (data) {
            $("#associatedLicensesPartialView").html(data);
        },
        error: function (objError) {

        }
    });
}

function previewDesctructionRequestData() {

    var applicationId = $("#hdnApplicationId").val();
    $.ajax({
        type: "GET",
        url: "/ExciseTax/GetDestructionMasterById?DestructionId=" + applicationId,
        dataType: "json",
        success: function (data) {
            if (data != null) {
                hideAllPartialViews('destructionRequestPartialView');

                var dataElements = "";

                dataElements += getDataElement('Destruction ID', data.DestructionId, 'ion-pound');
                dataElements += getDataElement('License ID', data.LicenseId, 'ion-calendar');
                dataElements += getDataElement('Destruction Location', data.DestructionLocation != "" ? data.DestructionLocation : 'None', 'ion-location');

                dataElements += getDataElement('Gallons to destroy-Spirit', data.SpiritGallons != "" ? data.SpiritGallons : 'None', 'ion-briefcase');
                dataElements += getDataElement('Gallons to destroy-Wine', data.WineGallons != "" ? data.WineGallons : 'None', 'ion-briefcase');
                dataElements += getDataElement('Gallons to destroy-Malt', data.MaltGallons != "" ? data.MaltGallons : 'None', 'ion-briefcase');

                dataElements += getDataElement('Contact Person', data.ContactPerson != "" ? data.ContactPerson : 'None', 'ion-person');
                dataElements += getDataElement('Email', data.ContactPersonEmail != "" ? data.ContactPersonEmail : 'None', 'ion-email');
                dataElements += getDataElement('Phone', data.ContactPersonTelephone != "" ? data.ContactPersonTelephone : 'None', 'ion-filing');
                dataElements += getDataElement('Address1', data.DestructionAddress1 != "" ? data.DestructionAddress1 : 'None', 'ion-location');
                dataElements += getDataElement('Address2', data.DestructionAddress2 != "" ? data.DestructionAddress2 : 'None', 'ion-location');
                dataElements += getDataElement('City', data.DestructionCity != "" ? data.DestructionCity : 'None', 'ion-location');
                dataElements += getDataElement('Zip', data.DestructionZip != "" ? data.DestructionZip : 'None', 'ion-location');

                dataElements += getDataElement('Destruction Method', data.DestructionMethod != "" ? data.DestructionMethod : 'None', 'ion-qr-scanner');
                dataElements += getDataElement('File', generateExciseFilesTemplate(data.Files), 'ion-filing');
                dataElements += getDataElement('Destruction Reason', data.DestructionReason != "" ? data.DestructionReason : 'None', 'ion-calendar');
                dataElements += getDataElement('Approved Status', data.isDestructApproved == 'true' ? 'Yes' : data.isDestructApproved == 'false' ? 'No' : 'Approval Pending', 'ion-clock');

                dataElements += getDataElement('Destruction DateTime', data.DestructionDateTimeText, 'ion-clock');



                document.getElementById('destructionRequestData').innerHTML = dataElements;
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



function generateExciseFilesTemplate(files) {

    if (files == null || files.length == 0) return 'None';
    var fileUrls = "";
    var index = 0;
    for (var i = 0; i < files.length; i++) {
        if (i > index) {
            index = i;
            fileUrls += "<br />"
        }
        fileUrls += "<a href='/ExciseTax/DownloadFile?FileID=" + files[i].EncriptedFileId + "' target='_blank' class='link'>" + files[i].FileName + "</a>"
    }
    return fileUrls;
}

function validationRowSelected() {

    var els = document.getElementsByName("checkedFinalizeValidation");
    var count = 0;

    Array.prototype.forEach.call(els, function (el) {
        if (el.checked == false) {
            count++;
        }
    });
    if (count > 0) {
        $("#modalbtnContinue").hide();
    }
    else {
        $("#modalbtnContinue").show();
    }
}

function previewInspectionNotes(applicationId) {
    if (applicationId == 0)
        return;

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    selectedworkitemType = urlParams.get('WorkitemType');
    selectedworkitemType = selectedworkitemType.replace('_Search', '');
    selectedworkitemType = selectedworkitemType.replace('_Create', '');
    selectedworkitemType = selectedworkitemType.replace('#', '');
    $.ajax({
        type: "GET",
        url: "/Enforcement/GetNotesDetails?recordId=" + applicationId + "&recTypeId=" + selectedworkitemType,
        contentType: "application/html",
        dataType: "html",
        success: function (results) {
            hideAllPartialViews("inspectionNotesPartialView");
            $("#inspectionNotesPartialView").html(results);
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        },
    });

}
function previewPLATNotes(applicationId) {
    if (applicationId == 0)
        return;

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    selectedworkitemType = urlParams.get('WorkitemType');
    selectedworkitemType = selectedworkitemType.replace('_Search', '');
    selectedworkitemType = selectedworkitemType.replace('_Create', '');
    selectedworkitemType = selectedworkitemType.replace('#', '');
    $.ajax({
        type: "GET",
        url: "/Enforcement/GetNotesDetails?recordId=" + applicationId + "&recTypeId=" + selectedworkitemType,
        contentType: "application/html",
        dataType: "html",
        success: function (results) {
            HideLoader();
            hideAllDivs('menu_160');
            hideAllPartialViews("platNotesPartialView"); //hideAllPartialViews
            $("#platNotesPartialView").html(results);
        },
        error: function (xhr) {
            HideLoader();
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        },
    });

}

function hideMobileSidebar() {
    $("body").toggleClass("sidebar-enable");
    $("#sidebarToggle").css("transform", "rotate(180deg)");
}

function appendLocation(input, newVal) {
    if (!newVal) return input;

    if (input && input.length > 0)
        input += ', ' + newVal;
    else
        input = newVal;
    return input;
}

function getLocation(data) {
    let location = appendLocation(null, data.AddressLine1);
    location = appendLocation(location, data.AddressLine2);
    location = appendLocation(location, data.City);
    location = appendLocation(location, data.State);
    location = appendLocation(location, data.ZipCode);
    return location;
}

function getPLATDetails(platId, callback) {
    $.ajax({
        type: "GET",
        url: "/Enforcement/GetENF_PLATRequests?platId=" + platId,
        dataType: "json",
        success: function (data) {
            callback(data);
            $("#hdnDeterminationStatus").val(data.DeterminationStatusId);
        },
        error: function (xhr) {
            HideLoader();
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        },
    });
}

function previewPLATInfo() {
    /*if (applicationId == '') { applicationId = $("#hdnApplicationId").val(); }*/
    var applicationId = $("#hdnApplicationId").val();
    getPLATInfoHTML(applicationId, function (html) {
        hideAllPartialViews('platInfoPartialView');
        document.getElementById('platInfoPartialViewData').innerHTML = html;
    });
}

function getPLATInfoHTML(PLATID, callBack) {

    getPLATDetails(PLATID, function (data) {
        HideLoader();
        if (data != null) {

            var dataElements = "";
            if (data.ComplaintId && !isNaN(data.ComplaintId) && data.ComplaintId > 0) {
                let messageHTML = '<div class="alert alert-warning d-flex mb-0 mt-2"><p class="text-danger sero-caption mb-0">';
                messageHTML += 'A protest exists on this application. Protest <u>';
                if (data.ComplaintWorkItemId > 0 && data.ComplaintWorkItemTypeId > 0 && data.ComplaintWorkItemType != '') {
                    let complaintUrl = '/process/workflow?WorkitemID=' + data.ComplaintWorkItemId + '&WorkitemTypeID=' + data.ComplaintWorkItemTypeId + '&WorkitemType=' + data.ComplaintWorkItemType + '#';
                    messageHTML += '<a class="text-danger"" href="' + complaintUrl + '">#' + data.ComplaintId + '</a>';
                }
                else {
                    messageHTML += '#' + data.ComplaintId;
                }
                messageHTML += '</u>.';
                //messageHTML += 'A protest exists on this application. Protest <u><a class="text-danger"" href="' + complaintUrl + '">#' + data.ComplaintId + '</a></u>.';
                messageHTML += '</p></div>';
                dataElements += messageHTML;
            }
            dataElements += getDataElementHeaderOnly('Basic Information');
            dataElements += getDataElement('PLAT ID', data.PlatId, 'ion-pound');
            dataElements += getDataElement('Location Address', getLocation(data), 'ion-location');
            dataElements += getDataElement('County', data.County != "" && data.County ? data.County : 'None', 'ion-location');
            dataElements += getDataElement('Status', data.Status, 'ion-refresh');
            dataElements += getDataElement('Lead Investigator', data.CreatedBy != "" ? data.CreatedBy : 'None', 'ion-person');
            dataElements += getDataElement('Created Date', data.StrCreatedDate != "" ? data.StrCreatedDate : 'None', 'ion-calendar');
            dataElements += getDataElement('Last Modified Date', data.StrModifiedDate != "" ? data.StrModifiedDate : 'None', 'ion-calendar');

            dataElements += getDataElementHeaderOnly('PLAT Request Details');
            dataElements += getDataElement('Application Type', data.ApplicationType, 'ion-qr-scanner');
            let applicationIDNavUrl = '<a href="/process/workflow?WorkitemID=' + data.WorkItemID + '&WorkitemTypeID=' + data.WorkItemTypeID + '&WorkitemType=' + data.WorkItemType + '#">' + data.ApplicationId + '</a>';
            dataElements += getDataElement('Application Number', applicationIDNavUrl, 'ion-calendar');
            dataElements += getDataElement('Original Application Received', data.StrApplicationReceived != "" ? data.StrApplicationReceived : 'None', 'ion-calendar');
            //dataElements += getDataElement('Original Application Received', data.ApplicationReceived, 'ion-calendar');
            dataElements += getDataElement('License Type', data.LicenseType, 'ion-folder');
            dataElements += getDataElement('Entity Name', data.EntityName, 'ion-briefcase');
            dataElements += getDataElement('Trade Name', data.TradeName, 'ion-cube');
            dataElements += getDataElement('License Number', data.LicenseId, 'ion-calendar');
            dataElements += getDataElement('HAS ELF Records', data.HasELFRecords ? 'Yes' : 'No', 'ion-filing');
            let hasMR = '';
            if (data.HasMREntity === true) hasMR = 'On Entity';
            if (data.HasMRLocation === true) {
                if (hasMR.length > 0) hasMR += ' | ';
                hasMR += 'On Location';
            }
            if (data.HasMRLicense === true) {
                if (hasMR.length > 0) hasMR += ' | ';
                hasMR += 'On License';
            }

            dataElements += getDataElement('HAS MR', hasMR, 'ion-code-working');
            //dataElements += getDataElement('Requested Date', data.StrRequestedDate != "" ? data.StrRequestedDate : 'None', 'ion-briefcase');




            //dataElements += getDataElement('Modified Date', data.StrModifiedDate != "" ? data.StrModifiedDate : 'None', 'ion-briefcase');

            //document.getElementById('platInfoPartialViewData').innerHTML = dataElements;
            if (data.RequestDescription && data.RequestDescription != '' && document.getElementById('plat_info_notes') != null) {
                document.getElementById('plat_info_notes').classList.remove('hidden');
                $('#plat_info_notes').html(
                    $('<div/>', {
                        html: data.RequestDescription
                    }).text()
                )
            }
            if (callBack)
                callBack(dataElements);
            else
                document.getElementById('platInfoPartialViewData').innerHTML = dataElements;
        }
        else {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "No record was found." }, "warning");
        }
    });
    if ($("#hdnPLATStatus").val() === 'Closed - Determination Made' || $("#hdnPLATStatus").val() === 'Closed - Rejected') {
        $("#selectPlatInformationActions option[value= 'share']").hide();
        $("#btnPlatDeterminationEdit").hide();

    }
}

//ELF data
function CancelELFdata() {
    previewELFdata();
}

function CreateELFdata() {
    isError = true;

    var ELFdivisionID = document.getElementById('ELFdataDivision').value;
    //var ELFOfficerID = document.getElementById('ELFdataOfficers').value;
    var ELFdataNotes = document.getElementById('elf_Description').value;
    var ELFdatadivisionName = $('#ELFdataDivision option:selected').text();
    //var ELFdataOfficerName = $('#ELFdataOfficers option:selected').text();

    if (ELFdivisionID != -1) {
        document.getElementById('err_elf_Division').classList.add('hidden');
    }
    else {
        isError = false;
        document.getElementById('err_elf_Division').classList.remove('hidden');
    }

    //if (ELFOfficerID != -1) {
    //    document.getElementById('err_elf_OfficerName').classList.add('hidden');
    //}
    //else {
    //    isError = false;
    //    document.getElementById('err_elf_OfficerName').classList.remove('hidden');
    //}

    if (ELFdataNotes != null && ELFdataNotes != "") {
        document.getElementById('err_elf_Description').classList.add('hidden');
    }
    else {
        isError = false;
        document.getElementById('err_elf_Description').classList.remove('hidden');
    }

    if (!isError)
        return false;

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    var URLworkitemID = urlParams.get('WorkitemID');

    var ELFID = $("#hdnELFID").val();
    var applicationId = $("#hdnApplicationId").val();
    const workIemType = getWorkItemType();
    var ELFdataRequest = new Object();
    ELFdataRequest.DivisionName = ELFdatadivisionName;
    ELFdataRequest.DivisionId = ELFdivisionID;
    ELFdataRequest.NotesDescription = ELFdataNotes;
    //ELFdataRequest.OfficerName = ELFdataOfficerName;
    ELFdataRequest.PlatID = applicationId;
    ELFdataRequest.ApplicationID = URLworkitemID;
    ELFdataRequest.ELFID = 0;
    //=======================
    $.ajax({
        url: '/Apps/CheckUserSession',
        type: 'GET',
        success: function (response) {
            if (response === "False" || response === "false" || response === false) {
                alert("Session timed out. Please log in again.");
                window.location.href = "/Apps/LogOff";
            } else {
                $.ajax({
                    type: "POST",
                    url: "/Enforcement/SaveENF_ELFdataRequest",
                    contentType: "application/json",
                    data: JSON.stringify(ELFdataRequest),
                    success: function (data) {
                        var popupNotification = $("#Notification").data("kendoNotification");
                        if (data) {
                            popupNotification.show({ message: "Request processed successfully." }, "success");
                            document.getElementById('createELFdataForm').reset();
                            document.getElementById('PlatStatusNoteRemainingCharacters').textContent = '500';
                            previewELFdata();
                        }
                        else {
                            popupNotification.show({ message: "Error processing request." }, "error");
                        }
                    },
                    error: function (objError) {
                        var popupNotification = $("#Notification").data("kendoNotification");
                        popupNotification.show({ message: "Error suspending plat." }, "error");
                    }
                });
            }
        },
    });
    //=======================
}

function UpdateELFdata() {
    isError = true;

    var ELFdivisionID = document.getElementById('ELFdataDivision1').value;
    //var ELFOfficerID = document.getElementById('ELFdataOfficers1').value;
    var ELFdataNotes = document.getElementById('elf_Description1').value;
    var ELFdatadivisionName = $('#ELFdataDivision1 option:selected').text();
    //var ELFdataOfficerName = $('#ELFdataOfficers1 option:selected').text();

    if (ELFdivisionID != -1) {
        document.getElementById('err_elf_Division1').classList.add('hidden');
    }
    else {
        isError = false;
        document.getElementById('err_elf_Division1').classList.remove('hidden');
    }

    //if (ELFOfficerID != -1) {
    //    document.getElementById('err_elf_OfficerName1').classList.add('hidden');
    //}
    //else {
    //    isError = false;
    //    document.getElementById('err_elf_OfficerName1').classList.remove('hidden');
    //}

    if (ELFdataNotes != null && ELFdataNotes != "") {
        document.getElementById('err_elf_Description1').classList.add('hidden');
    }
    else {
        isError = false;
        document.getElementById('err_elf_Description1').classList.remove('hidden');
    }

    if (!isError)
        return false;

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    var URLworkitemID = urlParams.get('WorkitemID');

    var ELFID = $("#hdnELFID").val();
    var applicationId = $("#hdnApplicationId").val();
    const workIemType = getWorkItemType();
    var ELFdataRequest = new Object();
    ELFdataRequest.DivisionName = ELFdatadivisionName;
    ELFdataRequest.DivisionId = ELFdivisionID;
    ELFdataRequest.NotesDescription = ELFdataNotes;
    //ELFdataRequest.OfficerName = ELFdataOfficerName;
    ELFdataRequest.PlatID = applicationId;
    ELFdataRequest.ApplicationID = URLworkitemID;
    ELFdataRequest.ELFID = ELFID;

    $.ajax({
        type: "POST",
        url: "/Enforcement/SaveENF_ELFdataRequest",
        contentType: "application/json",
        data: JSON.stringify(ELFdataRequest),
        success: function (data) {
            var popupNotification = $("#Notification").data("kendoNotification");
            if (data) {
                popupNotification.show({ message: "Request processed successfully." }, "success");
                document.getElementById('createELFdataForm').reset();
                document.getElementById('PlatStatusNoteRemainingCharacters').textContent = '500';
                previewELFdata();
            }
            else {
                popupNotification.show({ message: "Error processing request." }, "error");
            }
        },
        error: function (objError) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Error suspending plat." }, "error");
        }
    });


}

function AddELFdata() {

    const applicationId = $("#hdnApplicationId").val();
    hideAllPartialViews("CreateELFdataPartialView");
    document.getElementById('createELFdataForm').classList.remove('hidden');
    document.getElementById('platIDHeadingforELFCreation').innerHTML = applicationId;

    /*HideLoader();*/
    //if ($("#hdnDeterminationStatus").val() == 0) {
    document.getElementById('ELFdataDivision').value = -1;
    //document.getElementById('ELFdataOfficers').value = -1;
    //}
    //else {
    //    document.getElementById('plat_determinationStatus').value = $("#hdnDeterminationStatus").val();
    //}
    //document.getElementById('txtPlatDeterminationNote').value = $("#hdnDeterminationNotes").val();
    //getENF_ELFdataRequest();
    HideLoader();
}

function EditELFdata(ELFID) {

    const applicationId = $("#hdnApplicationId").val();
    hideAllPartialViews("EditELFdataPartialView");
    document.getElementById('EditELFdataForm').classList.remove('hidden');
    document.getElementById('platIDHeadingforELFEdit').innerHTML = applicationId;
    $('.ELFdataDivision-section').hide();
    $('#ELFdataDivision,.ELFdataDivision-section').hide();

    $.ajax({
        type: "GET",
        data: { "ELFID": ELFID },
        url: "/Enforcement/GetELFdataRequest?ELFID=" + ELFID,
        dataType: "json",
        success: function (results) {
            HideLoader();

            //isDelete = false;
            if (results.length != 0) {

                $("#hdnELFDivision").val(results.DivisionId);
                //$("#hdnELFOfficer").val(results.OfficerName);
                $("#hdnELFNotes").val(results.NotesDescription);
                $("#hdnELFID").val(results.ElfId);
                //var popupNotification = $("#Notification").data("kendoNotification");
                //popupNotification.show({ message: "ELF data has been deleted." }, "success");
                //setTimeout(() => {
                //    previewELFdata();
                //}, 1000);


                $("#ELFdataDivision1").val($("#hdnELFDivision").val());
                document.getElementById("elf_Description1").value = $("#hdnELFNotes").val();
                //document.getElementById('ELFdataOfficers1').text = $("#hdnELFOfficer").val();
                //$("#ELFdataOfficers1 option:contains(" + $("#hdnELFOfficer").val() + ")").attr('selected', 'selected');
                // document.getElementById('ELFdataOfficers').value = "Enforcement";
            }


        },
        error: function (objError) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
            //isDelete = false;
        }
    });


    /*HideLoader();*/
    //if ($("#hdnDeterminationStatus").val() == 0) {

    //}
    //else {
    //    document.getElementById('plat_determinationStatus').value = $("#hdnDeterminationStatus").val();
    //}
    //document.getElementById('txtPlatDeterminationNote').value = $("#hdnDeterminationNotes").val();
    //getENF_ELFdataRequest();

}

function previewELFdata() {
    const applicationId = $("#hdnApplicationId").val();
    hideAllPartialViews("ELFdataPartialView");
    getENF_ELFdataRequest();
    //document.getElementById('ElfDataForm').classList.add('hidden');
    //document.getElementById('viewElfData').classList.remove('hidden');
    //document.getElementById('btnElfDataEdit').classList.remove('hidden');
    ////Load determination from database
    //const workIemType = getWorkItemType();
    //document.getElementById('PlatIDHeading').innerHTML = workIemType.Code + ' ID';
    document.getElementById('platIDHeadingforELF').innerHTML = applicationId;

    //getPLATDetails(workIemType.ItemId, function (data) {
    HideLoader();
    //    let dataElements = "";

    //    dataElements += getDataElement('Status', data.Status, 'ion-refresh');
    //    dataElements += getDataElement('Last Modified By', data.ModifiedBy != "" ? data.ModifiedBy : 'None', 'ion-person');
    //    dataElements += getDataElement('Last Modified Date', data.StrModifiedDate != "" ? data.StrModifiedDate : 'None', 'ion-calendar');
    //    dataElements += getDataElement('Action Note', data.ActionNote === null ? 'None' : data.ActionNote, 'ion-calendar');
    //    document.getElementById('viewPlatDetermination').innerHTML = dataElements;
    //});
}


function getENF_ELFdataRequest() {
    if (isClosed() || $('#hdnWorkItemStatus').val() == 'Closed')
        document.getElementById('btnAddELFdata').classList.add('hidden');
    else
        document.getElementById('btnAddELFdata').classList.remove('hidden');
    const applicationId = $("#hdnApplicationId").val();
    const workIemType = getWorkItemType();
    //document.getElementById('platHistoryItemTypeTitle').innerHTML = workIemType.Name + ' ID';
    //document.getElementById('platHistoryItemTypeRefId').innerHTML = workIemType.ItemId;
    //ShowLoader(); //called from other function
    //document.getElementById('platHistoryItemPartialView').classList.add('hidden');
    $('#ELFdataTypeGrid').empty().html('<div id="asscSearchResult"></div>')
    //document.getElementById('ELFdataItemType').innerHTML = historyType;
    //document.getElementById('ELFdataTypeName').innerHTML = historyType;
    document.getElementById('ELFdataPartialView_grid').classList.add('hidden');
    var searchCriteria = new Object();

    $.ajax({
        type: "GET",
        url: "/Enforcement/GetENF_ELFdataRequest?platId=" + applicationId,
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(searchCriteria),
        success: function (results) {
            HideLoader();
            hideAllPartialViews("");
            document.getElementById('ELFdataPartialView').classList.remove('hidden');
            if (results.length > 0) {
                document.getElementById('ELFdataPartialView_grid').classList.remove('hidden');
                $("#ELFdataTypeGrid").kendoGrid({
                    toolbar: ["excel"],
                    excel: {
                        fileName: "ELF Data " + ".xlsx",
                        allPages: true
                    },
                    dataSource: {
                        data: results,
                        schema: {
                            model: {
                                fields: {
                                    PLATID: { type: "number" },
                                    ElfId: { type: "number" },
                                    DivisionName: { type: "string" },
                                    NotesDescription: { type: "string" },
                                    OfficerName: { type: "string" },
                                    CreatedByName: { type: "string" },
                                    CreatedDate: { type: "date" },
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
                                neq: "Is not equal to",
                                contains: "Contains"
                            }
                        }
                    },
                    columns: [

                        //{ field: "PLATID", title: "PLATID", width: 100 },
                        //{ field: "ElfId", title: "ELFID", width: 70 },
                        { field: "CreatedByName", title: "Added By", width: 100 },
                        { field: "DivisionName", title: "Division", width: 100 },
                        { field: "NotesDescription", title: "Notes", width: 140 },
                        { field: "CreatedDate", title: "Added on", width: 100, format: "{0:MM/dd/yyyy}" },
                        { field: "OfficerName", title: "Officer Name", width: 100 }
                        ,
                        {
                            template: "<a type='button' onclick='EditELFdata(\"#=ElfId#\")' > <i class='ion-ios7-paper-outline'></i></a>",
                            field: "ElfId",
                            filterable: false,
                            sortable: false,
                            width: 50,
                            title: "Edit",
                            hidden: isClosed() || $('#hdnWorkItemStatus').val() == 'Closed',
                            headerAttributes: { style: "color: #333; font-size: 15px; font-weight: 600; text-decoration: none;" }
                        },
                        {
                            template: "<a  onclick=\"DeleteELFDataRequest(\'#=ElfId#\')\"  ><i class='text-danger k-icon k-i-delete'></i></a>",
                            field: "ElfId",
                            filterable: false,
                            sortable: false,
                            width: 50,
                            title: "Delete",
                            hidden: isClosed() || $('#hdnWorkItemStatus').val() == 'Closed',
                            headerAttributes: { style: "color: #333; font-size: 15px; font-weight: 600; text-decoration: none;" }
                        }
                        //,{
                        //    command: [
                        //        {
                        //            name: "edit",
                        //            text: {
                        //                edit: " ",
                        //                update: " ",
                        //                cancel: " "
                        //            }
                        //        },
                        //        {
                        //            name: "destroy",
                        //            text: " "
                        //        }
                        //    ],
                        //    title: "Actions",
                        //    width: 180
                        //}
                    ]
                });
                //var grid = $("#ELFdataTypeGrid").data("kendoGrid");
                //grid.hideColumn(0);
            }
            else {
                var popupNotification = $("#Notification").data("kendoNotification");
                //TODO historyType not defined.Code commited with commit id 0bfffa3
                //popupNotification.show({ message: "No " + historyType.toLowerCase() + " records found for this item." }, "warning");
            }
        },
        error: function (xhr) {
            HideLoader();
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        },
    });
}

function cancelDeleteELFData() {
    isDelete = false;
    $('#delete').hide();
    $('#delete').data("kendoDialog").close();
    $('#delete').removeAttr('elf-id')
}

function onDeleteELFData() {
    let ELFID = $('#delete').attr('elf-id');
    $.ajax({
        type: "POST",
        data: { "ELFID": ELFID },
        url: "/Enforcement/DeleteENF_ELFdataRequest?ELFID=" + ELFID,
        dataType: "json",
        success: function (results) {
            isDelete = false;
            if (results.length != 0) {

                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "ELF data has been deleted." }, "success");
                setTimeout(() => {
                    previewELFdata();
                }, 1000);

            }
        },
        error: function (objError) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
            isDelete = false;
        }
    });
}

//ELF grid data end
function DeleteELFDataRequest(ELFID) {
    isDelete = true;
    var dialog = $("#delete");
    dialog.kendoDialog({
        width: "500px",
        title: false,
        closable: false,
        modal: true,
        content: ("<div class='text-center'>" +
            "</div>" +
            "<div class='text-center'>" +
            "Are you sure you want to delete the ELF?" +
            "</div>"),
        actions: [
            { text: 'No', action: cancelDeleteELFData },
            { text: 'Yes', primary: true, action: onDeleteELFData }
        ],
    });
    $('#delete').attr('elf-id', ELFID);
    $("#delete").show();

    dialog.data("kendoDialog").open();
}

function getENF_PLATWorkItemHistory(historyType) {
    const applicationId = $("#hdnApplicationId").val();
    const workIemType = getWorkItemType();
    document.getElementById('platHistoryItemTypeTitle').innerHTML = workIemType.Name + ' ID';
    document.getElementById('platHistoryItemTypeRefId').innerHTML = workIemType.ItemId;
    //ShowLoader(); //called from other function
    //document.getElementById('platHistoryItemPartialView').classList.add('hidden');
    $('#platHistoryItemTypeGrid').empty().html('<div id="asscSearchResult"></div>')
    document.getElementById('platHistoryItemType').innerHTML = historyType;
    //document.getElementById('platHistoryItemTypeName').innerHTML = historyType;
    if (historyType == 'License History') {
        var displayhistoryTypeName = historyType + ' which Application status are in  Cancelled,Suspended,Temporarily Surrendered and Surrendered ';
        document.getElementById('platHistoryItemTypeName').innerHTML = displayhistoryTypeName;
    } else {
        document.getElementById('platHistoryItemTypeName').innerHTML = historyType;
    }
    document.getElementById('platHistoryItemPartialView_grid').classList.add('hidden');
    var searchCriteria = new Object();

    $.ajax({
        type: "GET",
        url: "/Enforcement/GetENF_PLATWorkItemPersonHistory?platId=" + applicationId + "&historyType=" + historyType.replace(' ', ''),
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(searchCriteria),
        success: function (results) {
            HideLoader();
            hideAllPartialViews("");
            document.getElementById('platHistoryItemPartialView').classList.remove('hidden');
            if (results.length > 0) {
                document.getElementById('platHistoryItemPartialView_grid').classList.remove('hidden');
                $("#platHistoryItemTypeGrid").kendoGrid({
                    toolbar: ["excel"],
                    excel: {
                        fileName: "PLAT " + historyType + ".xlsx",
                        allPages: true
                    },
                    dataSource: {
                        data: results,
                        schema: {
                            model: {
                                fields: {
                                    PlatID: { type: "number" },
                                    PersonName: { type: "string" },
                                    Role: { type: "string" },
                                    LicenseID: { type: "number" },
                                    LicenseType: { type: "string" },
                                    EntityName: { type: "string" },
                                    Violation: { type: "string" },
                                    CustomInvNumber: { type: "number" },
                                    Status: { type: "string" },
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
                                neq: "Is not equal to",
                                contains: "Contains"
                            }
                        }
                    },
                    columns: [

                        { field: "PersonName", title: "Person Name", width: 100, hidden: historyType != PlatHistoryTypes.Person },
                        { field: "Role", title: "Role", width: 70, hidden: historyType != PlatHistoryTypes.Person },
                        { field: "LicenseID", title: "License Number", width: 80 },
                        { field: "LicenseType", title: "License Type", width: 140, hidden: historyType != PlatHistoryTypes.Person },
                        { field: "EntityName", title: "Entity Name", width: 100, hidden: historyType != PlatHistoryTypes.Person },

                        { field: "LicenseID", title: "Previous License Number", width: 110, hidden: historyType != PlatHistoryTypes.Location },
                        { field: "LicenseType", title: "License Type", width: 120, hidden: historyType != PlatHistoryTypes.Location },
                        { field: "Status", title: "License Status", width: 120 },
                        { field: "EntityName", title: "Entity Name", width: 100, hidden: historyType != PlatHistoryTypes.Location },

                        { field: "Violation", title: "Violation", width: 180, hidden: historyType != PlatHistoryTypes.License },
                        { field: "CustomInvNumber", title: "Investigation ID", width: 180, hidden: historyType != PlatHistoryTypes.License },
                    ]
                });
            }
            else {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "No " + historyType.toLowerCase() + " records found for this item." }, "warning");
            }
        },
        error: function (xhr) {
            HideLoader();
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        },
    });
}



function previewPLATNarrative(applicationId) {

    if (applicationId == 0)
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
        url: "/Enforcement/GetNarrativeDetails?recordId=" + applicationId + "&recTypeId=" + selectedworkitemType,
        contentType: "application/html",
        dataType: "html",
        success: function (results) {
            HideLoader();
            hideAllDivs('Narrative');
            hideAllPartialViews('platNarrativePartialView');
            $("#platNarrativePartialView").html(results);
        },
        error: function (xhr) {
            HideLoader();
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        },
    });

}
function previewInspectionNarrative(applicationId) {

    if (applicationId == 0)
        return;
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    selectedworkitemType = urlParams.get('WorkitemType');
    selectedworkitemType = selectedworkitemType.replace('_Search', '');
    selectedworkitemType = selectedworkitemType.replace('_Create', '');
    selectedworkitemType = selectedworkitemType.replace('#', '');
    $.ajax({
        type: "GET",
        url: "/Enforcement/GetNarrativeDetails?recordId=" + applicationId + "&recTypeId=" + selectedworkitemType,
        contentType: "application/html",
        dataType: "html",
        success: function (results) {
            hideAllPartialViews("inspectioNarrativePartialView");
            $("#inspectioNarrativePartialView").html(results);
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        },
    });

}

function previewPlatStatus() {

    if ($('#hdnWorkItemStatus').val() == 'Closed') {
        var popupNotification = $("#Notification").data("kendoNotification");
        popupNotification.show({ message: "Plat work item status is closed." }, "info");
        return;
    }

    hideAllPartialViews("platStatusPartialView");
    document.getElementById('platStatusForm').reset();
    document.getElementById('dvPlatFCAssignedTo').classList.add('hidden');

    if (isClosed())
        document.getElementById('savePlatStatus').classList.add('hidden');
    else
        document.getElementById('savePlatStatus').classList.remove('hidden');

    const workItem = getWorkItemType();
    document.getElementById('platStatusIDTitle').innerHTML = workItem.Code + ' ID';
    document.getElementById('platStatusID').innerHTML = workItem.ItemId;
    $.ajax({
        type: "GET",
        url: "/Enforcement/GetEnforcementData?category=PlatStatus",
        dataType: "json",
        success: function (results) {
            $('#plat_ddlFinalAction').empty();

            $.each(results, function (key, item) {
                if (item.Id < 5 && item.Value != 'Created') {
                    $('#plat_ddlFinalAction')
                        .append($("<option></option>")
                            .attr("value", item.Id)
                            .text(item.Value));
                }
            });
            HideLoader();
        },
        error: function (xhr) {
            HideLoader();
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        },
    });
}

function changePlatStatus(element) {
    if (element.value != PLAT_ASSIGNED_TO_ID) {
        document.getElementById('dvPlatFCAssignedTo').classList.add('hidden');
        return;
    }
    const workItem = getWorkItemType();
    document.getElementById('dvPlatFCAssignedTo').classList.remove('hidden');
    ShowLoader();
    $.ajax({
        type: "POST",
        url: "/Process/GetPrivateUsersByWorkItemTypeId?workItemTypeId=" + workItem.ItemTypeId,
        dataType: "json",
        success: function (results) {
            $('#plat_ddlAssignedTo').empty();
            $('#plat_ddlAssignedTo')
                .append($("<option></option>")
                    .attr("value", -1)
                    .text('Select'));
            $.each(results, function (key, item) {
                $('#plat_ddlAssignedTo')
                    .append($("<option></option>")
                        .attr("value", item.PrivateProfileId)
                        .text(item.EmployeeName));
            });
            HideLoader();
        },
        error: function (xhr) {
            HideLoader();
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        },
    });
}

function savePlatStatusInfo() {

    var isError = false;
    var regex = /^[a-zA-Z\d\-.,();:_%!'"\s]+$/i;
    var finalActionIdInput = document.getElementById('plat_ddlFinalAction').value;
    var closureNotesInput = document.getElementById('plat_closureNotes').value;
    var assignedToInput = document.getElementById('plat_ddlAssignedTo').value;
    var filesInput = $("#plat_closefile").data("kendoUpload").getFiles();

    if (finalActionIdInput == -1) {
        document.getElementById('err_plat_Status').classList.remove('hidden');
        isError = true;
    } else {
        document.getElementById('err_plat_Status').classList.add('hidden');
    }

    if (finalActionIdInput == PLAT_ASSIGNED_TO_ID && assignedToInput == -1) {
        document.getElementById('err_plat_ddlAssignedTo').classList.remove('hidden');
        isError = true;
    } else {
        document.getElementById('err_plat_ddlAssignedTo').classList.add('hidden');
    }

    if (closureNotesInput == "") {
        document.getElementById('err_plat_closureNotes').classList.remove('hidden');
        document.getElementById('formatErr_plat_closureNotes').classList.add('hidden');
        isError = true;
    } else if (closureNotesInput.replace(/\s+/g, '') == "" || !regex.test(closureNotesInput)) {
        document.getElementById('err_plat_closureNotes').classList.add('hidden');
        document.getElementById('formatErr_plat_closureNotes').classList.remove('hidden');
        isError = true;
    } else {
        document.getElementById('err_plat_closureNotes').classList.add('hidden');
        document.getElementById('formatErr_plat_closureNotes').classList.add('hidden');
    }

    if (filesInput.length > 0 && filesInput.length < 3) {
        for (var i = 0; i < filesInput.length; i++) {
            if (filesInput[i].size > 5242880) {
                document.getElementById('err_platclosefile').classList.remove('hidden');
                document.getElementById('err_platclosefileCount').classList.add('hidden');
                isError = true;
            }
            else {
                document.getElementById('err_platclosefile').classList.add('hidden');
                document.getElementById('err_platclosefileCount').classList.add('hidden');
            }
        }
    } else if (filesInput.length > 2) {
        isError = true;
        document.getElementById('err_platclosefile').classList.add('hidden');
        document.getElementById('err_platclosefileCount').classList.remove('hidden');
    } else {
        document.getElementById('err_platclosefile').classList.add('hidden');
        document.getElementById('err_platclosefileCount').classList.add('hidden');
    }

    if (isError) return;
    const workItem = getWorkItemType();
    var closeRequest = new Object();
    closeRequest.PlatId = workItem.ItemId;
    closeRequest.FinalActionId = finalActionIdInput;
    closeRequest.ClosureNotes = closureNotesInput;
    closeRequest.AssignedTo = assignedToInput;
    closeRequest.IsFileUploaded = false;
    closeRequest.Files = null;

    if (filesInput.length > 0) {
        var fileRequest = new FormData();
        for (var i = 0; i < filesInput.length; i++) {
            fileRequest.append('requestFiles', filesInput[i].rawFile)
        }

        $.ajax({
            type: "POST",
            enctype: 'multipart/form-data',
            url: "/Enforcement/UploadEnforcementFiles?uploadReason=" + "Finalize Plat file upload",
            data: fileRequest,
            processData: false,
            contentType: false,
            cache: false,
            timeout: 600000,
            success: function (result) {
                closeRequest.IsFileUploaded = true;
                closeRequest.Files = result;
                finalizePlat(closeRequest);

            },
            error: function (objError) {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "Error uploading file on plat." }, "error");
            }
        });
    }
    else
        finalizePlat(closeRequest);

}

function AddELFdata() {

    const applicationId = $("#hdnApplicationId").val();
    hideAllPartialViews("CreateELFdataPartialView");
    document.getElementById('createELFdataForm').classList.remove('hidden');
    document.getElementById('platIDHeadingforELFCreation').innerHTML = applicationId;

    /*HideLoader();*/
    //if ($("#hdnDeterminationStatus").val() == 0) {
    $('#ELFdataDivision,.ELFdataDivision-section').hide();
    document.getElementById('ELFdataDivision').value = 2;
    $('.Investigators-section').hide();
    //document.getElementById('ELFdataOfficers').value = -1;
    //}
    //else {
    //    document.getElementById('plat_determinationStatus').value = $("#hdnDeterminationStatus").val();
    //}
    //document.getElementById('txtPlatDeterminationNote').value = $("#hdnDeterminationNotes").val();
    //getENF_ELFdataRequest();
    HideLoader();
}

//function EditELFdata() {
//    
//    const applicationId = $("#hdnApplicationId").val();
//    hideAllPartialViews("CreateELFdataPartialView");
//    document.getElementById('createELFdataForm').classList.remove('hidden');
//    document.getElementById('platIDHeadingforELFCreation').innerHTML = applicationId;

//    /*HideLoader();*/
//    //if ($("#hdnDeterminationStatus").val() == 0) {
//    document.getElementById('ELFdataDivision').value = -1;
//    document.getElementById('ELFdataOfficers').value = -1;
//    //}
//    //else {
//    //    document.getElementById('plat_determinationStatus').value = $("#hdnDeterminationStatus").val();
//    //}
//    //document.getElementById('txtPlatDeterminationNote').value = $("#hdnDeterminationNotes").val();
//    //getENF_ELFdataRequest();
//    HideLoader();
//}

function previewELFdata() {
    const applicationId = $("#hdnApplicationId").val();
    hideAllPartialViews("ELFdataPartialView");
    getENF_ELFdataRequest();
    //document.getElementById('ElfDataForm').classList.add('hidden');
    //document.getElementById('viewElfData').classList.remove('hidden');
    //document.getElementById('btnElfDataEdit').classList.remove('hidden');
    ////Load determination from database
    //const workIemType = getWorkItemType();
    //document.getElementById('PlatIDHeading').innerHTML = workIemType.Code + ' ID';
    document.getElementById('platIDHeadingforELF').innerHTML = applicationId;

    //getPLATDetails(workIemType.ItemId, function (data) {
    HideLoader();
    //    let dataElements = "";

    //    dataElements += getDataElement('Status', data.Status, 'ion-refresh');
    //    dataElements += getDataElement('Last Modified By', data.ModifiedBy != "" ? data.ModifiedBy : 'None', 'ion-person');
    //    dataElements += getDataElement('Last Modified Date', data.StrModifiedDate != "" ? data.StrModifiedDate : 'None', 'ion-calendar');
    //    dataElements += getDataElement('Action Note', data.ActionNote === null ? 'None' : data.ActionNote, 'ion-calendar');
    //    document.getElementById('viewPlatDetermination').innerHTML = dataElements;
    //});
}

function editPlatDetermination() {

    document.getElementById('platDeterminationForm').classList.remove('hidden');
    document.getElementById('viewPlatDetermination').classList.add('hidden');
    document.getElementById('btnPlatDeterminationEdit').classList.add('hidden');
    const workIemType = getWorkItemType();
    //getPLATDetails(workIemType.ItemId, function (data) {
    //    HideLoader();
    //    if (data.DeterminationStatusId == 0) {
    //        document.getElementById('plat_determinationStatus').value = -1;
    //    }
    //    else {
    //        document.getElementById('plat_determinationStatus').value = data.DeterminationStatusId;
    //    }
    //        document.getElementById('txtPlatDeterminationNote').value = data.DeterminationNotes;
    //});
    HideLoader();
    if ($("#hdnDeterminationStatus").val() == 0) {
        document.getElementById('plat_determinationStatus').value = -1;
    }
    else {
        document.getElementById('plat_determinationStatus').value = $("#hdnDeterminationStatus").val();
    }
    document.getElementById('txtPlatDeterminationNote').value = $("#hdnDeterminationNotes").val();
    //   });
}

function finalizePlat(request) {
    $.ajax({
        type: "POST",
        url: "/Enforcement/FinalizePlat",
        contentType: "application/json",
        data: JSON.stringify(request),
        success: function (data) {
            var popupNotification = $("#Notification").data("kendoNotification");
            if (data == "Success") {
                var selectedFinalAction = $("#plat_ddlFinalAction option:selected").text();
                $("#hdnPLATStatus").val(selectedFinalAction);
                popupNotification.show({ message: "Request processed successfully." }, "success");
                document.getElementById('platStatusForm').reset();
                document.getElementById('PlatStatusNoteRemainingCharacters').textContent = '500';
            }
            else {
                popupNotification.show({ message: "Error processing request." }, "error");
            }
            /*checkPlatEditEligibility();*/

            previewCaseInformation(false);
        },
        error: function (objError) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Error suspending plat." }, "error");
        }
    });
}


function previewPlatDetermination() {

    hideAllPartialViews("platDeterminationPartialView");
    document.getElementById('platDeterminationForm').classList.add('hidden');
    document.getElementById('viewPlatDetermination').classList.remove('hidden');

    if ($('#hdnWorkItemStatus').val() != 'Closed') {
        document.getElementById('btnPlatDeterminationEdit').classList.remove('hidden');
    }

    if ($("#hdnPLATStatus").val() === 'Closed - Determination Made' || $("#hdnPLATStatus").val() === 'Closed - Rejected') {

        document.getElementById('btnPlatDeterminationEdit').classList.add('hidden');
    }
    //Load determination from database
    const workIemType = getWorkItemType();
    document.getElementById('platDeterminationIDTitle').innerHTML = workIemType.Code + ' ID';
    document.getElementById('platDeterminationID').innerHTML = workIemType.ItemId;

    getPLATDetails(workIemType.ItemId, function (data) {
        HideLoader();
        let dataElements = "";

        dataElements += getDataElement('Status', data.DeterminationStatus, 'ion-refresh');
        dataElements += getDataElement('Last Modified By', data.ModifiedBy != "" ? data.ModifiedBy : 'None', 'ion-person');
        dataElements += getDataElement('Last Modified Date', data.StrModifiedDate != "" ? data.StrModifiedDate : 'None', 'ion-calendar');
        dataElements += getDataElement('Action Note', data.DeterminationNotes === null ? 'None' : data.DeterminationNotes, 'ion-calendar');
        document.getElementById('viewPlatDetermination').innerHTML = dataElements;
        $("#hdnDeterminationStatus").val(data.DeterminationStatusId);
        $("#hdnDeterminationNotes").val(data.DeterminationNotes);

        //Determination only possible when plat status is (created or assigned) and there is atleast one associated investigator exists
        //if (data.StatusId == 1 || data.StatusId == 2)
        //    PreviewDeteminationEdit(workIemType.ItemId, workIemType.Code);
        //else {
        //    $("#btnPlatDeterminationEdit").hide();
        //}

        //If determination not initiated and is eligible for determination, then show determination add mode
        if ((!data.DeterminationStatus || data.DeterminationStatus == '')) {
            if (data.StatusId == 1 || data.StatusId == 2) {
                editPlatDetermination();
            }
            else {
                //Show message not eligible for determination
                let dataElements = "<div>Not eligible to perform determination</div>";
                document.getElementById('viewPlatDetermination').innerHTML = dataElements;
            }
        }
    });
}

function PreviewDeteminationEdit(workItemID, workItemType) {

    $.ajax({
        type: "GET",
        url: "/Enforcement/GetInvAssociatedInvestigators?ItemID=" + workItemID + "&WorkItemType=" + workItemType,
        success: function (data) {
            if (data != null && data.length > 0) {

                $("#btnPlatDeterminationEdit").show();
            }
            else {
                $("#btnPlatDeterminationEdit").hide();
            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        },
    });
}


function countCharacters(element, maxLength, messageContainer) {
    let textEntered, counter;
    textEntered = element.value;
    counter = (maxLength - (textEntered.length));
    if (counter <= 0) {
        element.value = textEntered.substring(0, maxLength);
        counter = 0;
    }
    document.getElementById(messageContainer).textContent = counter + ' characters remaining';
}

function savePlatDeterminationInfo() {

    var isError = false;
    var regex = /^[A-Za-z0-9,.!  ]+$/;

    var determinationStatusInput = document.getElementById('plat_determinationStatus').value;
    var determinationNoteInput = document.getElementById('txtPlatDeterminationNote').value;

    if (determinationStatusInput == -1) {
        document.getElementById('err_plat_determinationStatus').classList.remove('hidden');
        isError = true;
    } else {
        document.getElementById('err_plat_determinationStatus').classList.add('hidden');
    }

    if (determinationNoteInput == "") {
        document.getElementById('err_txtPlatDeterminationNote').classList.remove('hidden');
        document.getElementById('formatErr_txtPlatDeterminationNote').classList.add('hidden');
        isError = true;
    } else if (determinationNoteInput.replace(/\s+/g, '') == "" || !regex.test(determinationNoteInput)) {
        document.getElementById('err_txtPlatDeterminationNote').classList.add('hidden');
        document.getElementById('formatErr_txtPlatDeterminationNote').classList.remove('hidden');
        isError = true;
    } else {
        document.getElementById('err_txtPlatDeterminationNote').classList.add('hidden');
        document.getElementById('formatErr_txtPlatDeterminationNote').classList.add('hidden');
    }

    if (isError) return;

    const workItem = getWorkItemType();
    var request = new Object();
    request.PlatID = workItem.ItemId;
    request.DeterminationStatusId = determinationStatusInput;
    request.DeterminationNotes = determinationNoteInput;
    request.ReferenceItemID = workItem.ItemId;
    request.ReferenceItemTypeID = workItem.ItemTypeId;
    $("#hdnDeterminationStatus").val(determinationStatusInput);
    $("#hdnDeterminationNotes").val(determinationNoteInput);
    $.ajax({
        type: "POST",
        url: "/Enforcement/SavePlatDetermination",
        contentType: "application/json",
        data: JSON.stringify(request),
        success: function (data) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Plat determination saved successfully." }, "success");
            document.getElementById('platDeterminationForm').reset();
            previewPlatDetermination();
        },
        error: function (objError) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Error while processing determination request" }, "error");
        }
    });
}

function DoPlatInformationAction(element) {
    var platAction = element.value;
    switch (platAction) {
        case 'none':
            break;
        case 'share':
            sharePlatSummaryLink();
            element.value = 'none';
            break;
        case 'viewSummary':
            generatePlatViewSummary();
            element.value = 'none';
            break;
    }
}

function getDataElementPlatViewSummaryReportTR(title, value, colspan, width = 40) {
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

function getDataElementPlatViewSummaryReportHeader(title) {
    return ('<h3 class="text-center border-wrapper sero-headline5">' + title + '</h3>');
}

function getDataElementPlatViewSummaryReportTable(action) {
    if (action === 'start')
        return ('<div><table class="table table-borderless table-sm mb-1 table-mobile"> <tbody>');
    else
        return ("</tbody></table></div>");
}

function getDataElementPlatViewSummaryReportPageBreakAvoid(action) {
    if (action === 'start')
        return ('<div class="page -break-avoid">');
    else
        return ('</div>');
}

function getDataElementPlatViewSummaryReportLineBreak() {
    return ('<br />');
}

function printPlatViewSummaryPDF() {
    printJS({
        printable: 'platViewSummaryPrintArea',
        type: 'html',
        targetStyles: ["*"]
    })
}

function bindPlatSummaryReportBasicDetails() {
    $('#platViewSummaryPartialViewBasicInfo').empty();
    var applicationId = $("#hdnApplicationId").val();
    getPLATDetails(applicationId, function (data) {
        if (!data) {
            HideLoader();
            return;
        }
        var dataElements = '<div class="col-12">';
        dataElements += getDataElementPlatViewSummaryReportPageBreakAvoid('start');
        dataElements += getDataElementPlatViewSummaryReportTable('start');
        dataElements += getDataElementPlatViewSummaryReportTR('PLAT ID', data.PlatId);
        dataElements += getDataElementPlatViewSummaryReportTR('Location Address', getLocation(data));
        dataElements += getDataElementPlatViewSummaryReportTR('County', data.County != "" && data.County ? data.County : 'None');
        dataElements += getDataElementPlatViewSummaryReportTR('Status', data.Status);
        dataElements += getDataElementPlatViewSummaryReportTR('Lead Investigator', data.CreatedBy != "" ? data.CreatedBy : 'None');
        dataElements += getDataElementPlatViewSummaryReportTR('Created Date', data.StrCreatedDate != "" ? data.StrCreatedDate : 'None');
        dataElements += getDataElementPlatViewSummaryReportTR('Last Modified Date', data.StrModifiedDate != "" ? data.StrModifiedDate : 'None');
        dataElements += getDataElementPlatViewSummaryReportTable('end');

        dataElements += getDataElementPlatViewSummaryReportPageBreakAvoid('end');
        dataElements += getDataElementPlatViewSummaryReportLineBreak();
        dataElements += getDataElementPlatViewSummaryReportPageBreakAvoid('start');
        dataElements += getDataElementPlatViewSummaryReportHeader('PLAT Request Details');
        dataElements += getDataElementPlatViewSummaryReportTable('start');
        dataElements += getDataElementPlatViewSummaryReportTR('Application Type', data.ApplicationType);
        dataElements += getDataElementPlatViewSummaryReportTR('Application Number', data.ApplicationId);
        dataElements += getDataElementPlatViewSummaryReportTR('License Type', data.LicenseType);
        dataElements += getDataElementPlatViewSummaryReportTR('Entity Name', data.EntityName);
        dataElements += getDataElementPlatViewSummaryReportTR('Trade Name', data.TradeName);
        dataElements += getDataElementPlatViewSummaryReportTR('License Number', data.TradeName);
        dataElements += getDataElementPlatViewSummaryReportTR('HAS ELF Records', data.HasELFRecords ? 'Yes' : 'No');
        let hasMR = '';
        if (data.HasMREntity === true) hasMR = 'On Entity';
        if (data.HasMRLocation === true) {
            if (hasMR.length > 0) hasMR += ' | ';
            hasMR += 'On Location';
        }
        if (data.HasMRLicense === true) {
            if (hasMR.length > 0) hasMR += ' | ';
            hasMR += 'On License';
        }

        dataElements += getDataElementPlatViewSummaryReportTR('HAS MR', hasMR);
        dataElements += getDataElementPlatViewSummaryReportTR('Request Description', data.RequestDescription);
        dataElements += getDataElementPlatViewSummaryReportTable('end');
        dataElements += getDataElementPlatViewSummaryReportPageBreakAvoid('end');

        dataElements += "</div>";
        //document.getElementById('platViewSummaryPartialViewData').innerHTML = dataElements;
        $('#platViewSummaryPartialViewBasicInfo').append(dataElements);
        HideLoader();
    });
}


function bindPlatSummaryReportAssociations() {
    $('#platViewSummaryPartialViewAssociations').empty();
    const workItem = getWorkItemType();
    $.ajax({
        type: "GET",
        url: "/Enforcement/GetInvAssociations?itemTypeId=" + workItem.ItemTypeId + "&itemId=" + workItem.ItemId, // selectedInvestigationId,
        dataType: "json",
        success: function (results) {
            let dataElements = '<div class="col-12">';
            dataElements += getDataElementPlatViewSummaryReportHeader('Associations');
            $('#platViewSummaryPartialViewAssociations').append(dataElements);
            $('#platViewSummaryPartialViewAssociations').append('<div id="platViewSummaryPartialViewAssociationsData" />');
            $("#platViewSummaryPartialViewAssociationsData").kendoGrid({
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

function bindPlatSummaryReportInvestigators() {
    const workItem = getWorkItemType();
    $("#platViewSummaryPartialViewInvestigators").empty();
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
            dataElements += getDataElementPlatViewSummaryReportHeader('Investigators');
            $('#platViewSummaryPartialViewInvestigators').append(dataElements);
            $('#platViewSummaryPartialViewInvestigators').append('<div id="platViewSummaryPartialViewInvestigatorsData" />');
            $("#platViewSummaryPartialViewInvestigatorsData").kendoGrid({
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
                    { field: "AdditionalInfo", title: "AdditionalInfo", width: 200, encoded: false },
                ]
            });
            HideLoader();
        },
        error: function (xhr) {
            HideLoader();
        },
    });
}

function bindPlatSummaryReportNotes() {
    $("#platViewSummaryPartialViewNotes").empty();
    const workItem = getWorkItemType();
    $.ajax({
        type: "GET",
        url: "/Enforcement/GetEnforcementNotes?recordId=" + workItem.ItemId + "&recordType=Pre Licensure Assement Notes&recordTypeId=" + workItem.ItemTypeId,
        dataType: "json",
        success: function (results) {
            if (!results || results.result.length == 0) {
                HideLoader();
                return;
            }
            let dataElements = '<div class="col-12">';
            dataElements += getDataElementPlatViewSummaryReportHeader('Notes');
            $('#platViewSummaryPartialViewNotes').append(dataElements);
            $('#platViewSummaryPartialViewNotes').append('<div id="platViewSummaryPartialViewNotesData" />');
            results.result.forEach((item, index) => {
                item.Notes = htmlDecode(item.Notes);
            });

            let rowHTML = '<div class="col-12">';
            rowHTML += getDataElementPlatViewSummaryReportPageBreakAvoid('start');
            rowHTML += getDataElementPlatViewSummaryReportTable('start');
            results.result.forEach((item, index) => {
                rowHTML += getDataElementPlatViewSummaryReportTR('Added by', item.CreatedBy, undefined, 15);
                rowHTML += getDataElementPlatViewSummaryReportTR('Date', item.strDateCreated, undefined, 15);
                rowHTML += getDataElementPlatViewSummaryReportTR('Notes', item.Notes, 2, 15);
                rowHTML += getDataElementPlatViewSummaryReportTR('', '<br />', 2, 15);
            });
            rowHTML += getDataElementPlatViewSummaryReportTable('end');
            $("#platViewSummaryPartialViewNotesData").html(rowHTML);
            //Display in tabular format
            /*
            $("#platViewSummaryPartialViewNotesData").kendoGrid({
                dataSource: {
                    data: results,
                    schema: {
                        model: {
                            fields: {
                                NoteId: { type: "number" },
                                CreatedBy: { type: "string" },
                                DateCreated: { type: "date" },
                                Notes: { type: "string" }
                            }
                        }
                    },
                    pageSize: results.length
                },
                scrollable: false,
                columns: [
                    { field: "CreatedBy", title: "Added by", width: 80 },
                    { field: "DateCreated", title: "Date", width: 80, format: "{0:MM/dd/yyyy}" },
                    { field: "Notes", title: "Notes", width: 500, encoded: false }
                ]
            });*/
            HideLoader();
        },
        error: function (xhr) {
            HideLoader();
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        },
    });
}

function bindPlatSummaryReportNarratives() {
    $("#platViewSummaryPartialViewNarratives").empty();
    const workItem = getWorkItemType();
    $.ajax({
        type: "GET",
        url: "/Enforcement/GetEnforcementNotes?recordId=" + workItem.ItemId + "&recordType=Pre Licensure Assement Narrative&recordTypeId=" + workItem.ItemTypeId,
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
            dataElements += getDataElementPlatViewSummaryReportHeader('Narratives');
            $('#platViewSummaryPartialViewNarratives').append(dataElements);
            $('#platViewSummaryPartialViewNarratives').append('<div id="platViewSummaryPartialViewNarrativesData" />');

            let rowHTML = '<div class="col-12">';
            rowHTML += getDataElementPlatViewSummaryReportPageBreakAvoid('start');
            rowHTML += getDataElementPlatViewSummaryReportTable('start');
            results.forEach((item, index) => {
                rowHTML += getDataElementPlatViewSummaryReportTR('Added by', item.CreatedBy, undefined, 15);
                rowHTML += getDataElementPlatViewSummaryReportTR('Date', item.strDateCreated, undefined, 15);
                rowHTML += getDataElementPlatViewSummaryReportTR('Notes', item.Notes, 2, 15);
                rowHTML += getDataElementPlatViewSummaryReportTR('', '<br />', 2, 15);
            });
            rowHTML += getDataElementPlatViewSummaryReportTable('end');
            $("#platViewSummaryPartialViewNarrativesData").html(rowHTML);
            //Display in tabular format
            /*
            $("#platViewSummaryPartialViewNarrativesData").kendoGrid({
                dataSource: {
                    data: results,
                    schema: {
                        model: {
                            fields: {
                                NoteId: { type: "number" },
                                CreatedBy: { type: "string" },
                                DateCreated: { type: "date" },
                                Notes: { type: "string" }
                            }
                        }
                    },
                    pageSize: results.length
                },
                scrollable: false,
                columns: [
                    { field: "CreatedBy", title: "Added by", width: 80 },
                    { field: "DateCreated", title: "Date", width: 80, format: "{0:MM/dd/yyyy}" },
                    { field: "Notes", title: "Notes", width: 500, encoded: false }
                ]
            });
            */
            HideLoader();
        },
        error: function (xhr) {
            HideLoader();
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        },
    });
}

function bindPlatSummaryReportPersonHistory(historyType, container) {
    $("#" + container).empty();
    const workItem = getWorkItemType();
    $.ajax({
        type: "GET",
        url: "/Enforcement/GetENF_PLATWorkItemPersonHistory?platId=" + workItem.ItemId + "&historyType=" + historyType.replace(' ', ''),
        dataType: "json",
        contentType: "application/json",
        success: function (results) {
            if (!results || results.length == 0) {
                HideLoader();
                return;
            }
            let dataElements = '<div class="col-12">';
            dataElements += getDataElementPlatViewSummaryReportHeader(historyType);
            $('#' + container).append(dataElements);
            $('#' + container).append('<div id="' + container + 'Data" />');
            $("#" + container + "Data").kendoGrid({
                dataSource: {
                    data: results,
                    schema: {
                        model: {
                            fields: {
                                PlatID: { type: "number" },
                                PersonName: { type: "string" },
                                Role: { type: "string" },
                                LicenseID: { type: "number" },
                                LicenseType: { type: "string" },
                                EntityName: { type: "string" },
                                Violation: { type: "string" },
                                InvestigationID: { type: "number" },
                                Status: { type: "string" },
                            }
                        }
                    },
                    pageSize: results.length
                },
                groupable: false,
                scrollable: false,
                columns: [

                    { field: "PersonName", title: "Person Name", width: 100, hidden: historyType != PlatHistoryTypes.Person },
                    { field: "Role", title: "Role", width: 70, hidden: historyType != PlatHistoryTypes.Person },
                    { field: "LicenseID", title: "License Number", width: 80, hidden: historyType != PlatHistoryTypes.Person },
                    { field: "LicenseType", title: "License Type", width: 140, hidden: historyType != PlatHistoryTypes.Person },
                    { field: "EntityName", title: "Entity Name", width: 100, hidden: historyType != PlatHistoryTypes.Person },

                    { field: "LicenseID", title: "Previous License Number", width: 110, hidden: historyType != PlatHistoryTypes.Location },
                    { field: "LicenseType", title: "License Type", width: 120, hidden: historyType != PlatHistoryTypes.Location },
                    { field: "Status", title: "Status", width: 120, hidden: historyType != PlatHistoryTypes.Location },
                    { field: "EntityName", title: "Entity Name", width: 100, hidden: historyType != PlatHistoryTypes.Location },

                    { field: "Violation", title: "Violation", width: 180, hidden: historyType != PlatHistoryTypes.License },
                    { field: "InvestigationID", title: "Investigation ID", width: 180, hidden: historyType != PlatHistoryTypes.License },
                ]
            });
        },
        error: function (xhr) {
            HideLoader();
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        },
    });
}

function bindPlatHistory() {
    $("#platViewSummaryPartialViewHistory").empty();
    const workItem = getWorkItemType();
    var search = new Object();
    search.ReferenceID = workItem.ItemId;
    search.ReferenceTypeID = workItem.ItemTypeId;
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
            dataElements += getDataElementPlatViewSummaryReportHeader('PLAT History');
            $('#platViewSummaryPartialViewHistory').append(dataElements);
            $('#platViewSummaryPartialViewHistory').append('<div id="platViewSummaryPartialViewHistoryData" />');
            $("#platViewSummaryPartialViewHistoryData").kendoGrid({
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
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        },
    });
}

function bindPlatELFData() {
    $("#platViewSummaryPartialViewELFData").empty();
    const workItem = getWorkItemType();
    var search = new Object();
    $.ajax({
        type: "GET",
        url: "/Enforcement/GetENF_ELFdataRequest?platId=" + workItem.ItemId,
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(search),
        success: function (results) {
            if (!results || results.length == 0) {
                HideLoader();
                return;
            }
            let dataElements = '<div class="col-12">';
            dataElements += getDataElementPlatViewSummaryReportHeader('PLAT Extra Look Factors');
            $('#platViewSummaryPartialViewELFData').append(dataElements);
            $('#platViewSummaryPartialViewELFData').append('<div id="platViewSummaryPartialViewELFDataGrid" />');
            $("#platViewSummaryPartialViewELFDataGrid").kendoGrid({
                dataSource: {
                    data: results,
                    schema: {
                        model: {
                            fields: {
                                PLATID: { type: "number" },
                                ElfId: { type: "number" },
                                DivisionName: { type: "string" },
                                NotesDescription: { type: "string" },
                                OfficerName: { type: "string" },
                                CreatedBy: { type: "string" },
                            }
                        }
                    },
                    pageSize: results.length
                },
                scrollable: false,
                sortable: true,
                columns: [

                    { field: "PLATID", title: "PLATID", width: 100 },
                    { field: "ElfId", title: "ELFID", width: 70 },
                    { field: "DivisionName", title: "Division Name", width: 80 },
                    { field: "NotesDescription", title: "Notes Description", width: 140 },
                    { field: "OfficerName", title: "Officer Name", width: 100 },
                    { field: "CreatedBy", title: "Created By", width: 100 }
                ]
            });
        },
        error: function (xhr) {
            HideLoader();
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        },
    });
}

//Moved to SearchAssociation.js
//function htmlDecode(input) {
//    var e = document.createElement('div');
//    e.innerHTML = input;
//    return e.childNodes[0].nodeValue;
//}

function generatePlatViewSummary() {
    hideAllPartialViews("platViewSummaryPartialView");
    ShowLoader();

    bindPlatSummaryReportBasicDetails();
    bindPlatSummaryReportAssociations();
    bindPlatSummaryReportInvestigators();
    bindPlatSummaryReportNotes();
    bindPlatSummaryReportNarratives();
    bindPlatSummaryReportPersonHistory('Person History', 'platViewSummaryPartialViewPersonHistory');
    bindPlatSummaryReportPersonHistory('Location History', 'platViewSummaryPartialViewLocationHistory');
    bindPlatSummaryReportPersonHistory('License History', 'platViewSummaryPartialViewLicenseHistory');
    bindPlatELFData();
    bindPlatHistory();
}

function sharePlatSummaryLink() {
    ShowLoader();
    const workItem = getWorkItemType();
    $.ajax({
        type: "GET",
        url: "/Enforcement/ShareNavigation?selectedInvestigationId=" + workItem.ItemId + "&workitemtype=" + workItem.Code,
        contentType: "application/html",
        dataType: "html",
        success: function (data) {
            $("#platShareDetailsPopup").html(data);
            $("#sharemodal").modal('show');
            HideLoader();
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
            HideLoader();
        },
    });
}

function isPLATEligibleForEditinig() {
    return $("#hdnPLATStatus").val().indexOf('Closed') === -1;
}

function checkPlatEditEligibility() {
    const workIemType = getWorkItemType();
    getPLATDetails(workIemType.ItemId, function (data) {
        if (data.Status != null) {
            $("#hdnPLATStatus").val(data.Status);
        }
    });
}

function showComLeftMenuAccess(menuName) {
    var showMenu = false;
    var hasViewAccess = "False";
    if ($("#hdnHasViewAccess")) {
        hasViewAccess = $("#hdnHasViewAccess").val();
    }
    menuName = menuName.trim();
    if (menuName == "Overview" && hasViewAccess == "True") {
        showMenu = true;
    } else if (menuName == "Complaint Information" && hasViewAccess == "True") {
        showMenu = true;
    }
    //if (!show) {
    //    leftMenuSelectedId
    //}
    return showMenu;
}

function addClassName(id) {
    document.getElementById("" + id + "").classList.add("menu-item-active");
}

function removeClassName(id) {
    setTimeout(document.getElementById("" + id + "").classList.remove("menu-item-active"), 2000);
}


//TODO Move to common place
function countNoteCharacters(e, counterDiv) {
    let textEntered = e.target.value;
    let counter = (500 - (textEntered.length));
    document.getElementById(counterDiv).textContent = counter;
}

function shareLicenseLink() {
    var workItemType = $("#hdnWorkItemTypeID").val();
    var workItemID = $("#hdnWorkItemID").val();
    var workItemTypeId = document.getElementById("hdnWorkItemTypeID").value;

    $.ajax({
        type: "GET",
        url: "/Enforcement/ShareNavigation?selectedInvestigationId=" + $("#hdnApplicationId").val() + "&workitemtype=" + workItemTypeId,
        contentType: "application/html",
        dataType: "html",
        success: function (data) {
            
            $("#platShareDetailsPopup").html(data);
            $("#sharemodal").modal('show');
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        },
    });
}




//#Region // Complaint Non-Disclosure Order
function onChange_DdlComonActions() {

    var inspectionAction = $('#ddlComplaintActions').find(":selected").val();
    switch (inspectionAction) {
        case 'none':
            break;
        case 'addNDO':
            fn_Update_Complaint_NonDisclosureOrder('add');
            break;
        case 'removeNDO':
            //fn_Update_Complaint_NonDisclosureOrder('remove');
            fn_Ndo_Confirmation('COM');
            break;
        case 'share':
            shareLicenseLink();
            break;

    }
}

function fn_Update_Complaint_NonDisclosureOrder(isNdoType = 'remove') {
    var dv_com_ndoMsgObj = document.getElementById("ddlComplaintActions");
    var appId = $("#hdnApplicationId").val();
    var workItemType = $("#hdnWorkItemTypeID").val();

    let updateRequest = new Object();
    updateRequest.Id = appId;
    updateRequest.WorkItemType = workItemType;
    if (isNdoType == 'add') {
        updateRequest.IsNDO = true;
        isNDOExists = true;
        showNDO(true);
        if (workItemType == 'BOP') {
            workItem_Type = 'BOP';
            workItemTypeID = 5;
        }
        else if (workItemTypeID == 3 || workItemTypeID == '3')
            workItem_Type = 'COM';
        else if (workItemTypeID == 4 || workItemTypeID == '4')
            workItem_Type = 'PRT';
        GetNDODetailsById(updateRequest.Id, workItem_Type, workItemTypeID);
    } else if (isNdoType == 'remove') {
        updateRequest.IsNDO = false;
        isNDOExists = false;
        hideNDO();
    }
    //if (isNdoType == 'remove') {
    //    if (!confirm('Are you sure to Remove?')) { dv_com_ndoMsgObj.selectedIndex = 0; return; }
    //}
    fn_Update_NonDisclosureOrder(updateRequest);
}

function fn_get_Com_NonDisclosureOrder(isExpUser = false) {

    var appId = $("#hdnApplicationId").val();
    var workItemType = $("#hdnWorkItemTypeID").val();
    //var workItemTypeID = $("#hdnWorkItemTypeIDs").val();

    if (workItemType) {
        let requestObj = new Object();
        requestObj.Id = appId;
        requestObj.WorkItemType = workItemType;
        fn_Get_NonDisclosureOrder(requestObj, isExpUser);
    } else {
        // Msg: workItemType is null or undefined.
    }
}

function fn_ShowOrHide_ComplaintDll_Options(isNdo, isExpUser = false) {
    var dv_com_ndoMsgObj = document.getElementById("dv_com_ndoMsg");
    var ddlComplaintActionsObj = document.getElementById("ddlComplaintActions");
    $("#ddlComplaintActions").show();

    if (isExpUser) { //isExpungementMode()
        if (isNdo === true) {
            //dv_com_ndoMsgObj.classList.remove('hidden');
            $("#ddlComplaintActions option[value= 'addNDO']").hide();
            $("#ddlComplaintActions option[value= 'removeNDO']").show();

        } else {
            //dv_com_ndoMsgObj.classList.add('hidden');
            $("#ddlComplaintActions option[value= 'addNDO']").show();
            $("#ddlComplaintActions option[value= 'removeNDO']").hide();
        }

    }
    else {
        $("#ddlComplaintActions option[value= 'addNDO']").hide();
        $("#ddlComplaintActions option[value= 'removeNDO']").hide();
    }


    ddlComplaintActionsObj.selectedIndex = 0;

    if (isNdo === true) {
        dv_com_ndoMsgObj.classList.remove('hidden');
    } else {
        dv_com_ndoMsgObj.classList.add('hidden');
    }
}


//#EndRegion

// #Region Protest
function fn_get_Protest_NonDisclosureOrder(isExpUser = false) {
    var appId = $("#hdnApplicationId").val();
    var workItemType = $("#hdnWorkItemTypeID").val();
    if (workItemType) {
        let requestObj = new Object();
        requestObj.Id = appId;
        requestObj.WorkItemType = workItemType;
        requestObj.isProtest = true;
        fn_Get_NonDisclosureOrder(requestObj, isExpUser);
    } else {
        // Msg: workItemType is null or undefined.
    }
}

function fn_ShowOrHide_ProtestDll_Options(isNdo, isExpUser = false) {
    var dv_MsgObj = document.getElementById("dv_protest_ndoMsg");
    var ddlActionsObj = document.getElementById("ddlProtestActions");

    /* if (isExpungementMode()) {*/
    if (isExpUser) {
        if (isNdo === true) {
            //dv_MsgObj.classList.remove('hidden');
            $("#ddlProtestActions option[value= 'addNDO']").hide();
            $("#ddlProtestActions option[value= 'removeNDO']").show();
        } else {
            //dv_MsgObj.classList.add('hidden');
            $("#ddlProtestActions option[value= 'addNDO']").show();
            $("#ddlProtestActions option[value= 'removeNDO']").hide();
        }
    }
    else {
        $("#ddlProtestActions option[value= 'addNDO']").hide();
        $("#ddlProtestActions option[value= 'removeNDO']").hide();
    }

    ddlActionsObj.selectedIndex = 0;

    if (isNdo === true) {
        dv_MsgObj.classList.remove('hidden');
    } else {
        dv_MsgObj.classList.add('hidden');
    }
}

function onChange_DdlProtestActions() {
    var ddlSelectedValue = $('#ddlProtestActions').find(":selected").val();
    switch (ddlSelectedValue) {
        case 'none':
            break;
        case 'addNDO':
            fn_Update_Protest_NonDisclosureOrder('add');
            break;
        case 'removeNDO':
            // fn_Update_Protest_NonDisclosureOrder('remove');
            fn_Ndo_Confirmation('PRT');
            break;

    }
}

function fn_Update_Protest_NonDisclosureOrder(isNdoType) {
    /*var ddlActionsObj = document.getElementById("ddlProtestActions");*/
    var appId = $("#hdnApplicationId").val();
    var workItemType = $("#hdnWorkItemTypeID").val();
    var workItemTypeID = $("#hdnWorkItemTypeIDs").val();
    let workItem_Type = '';
    let updateRequest = new Object();
    updateRequest.Id = appId;
    updateRequest.WorkItemType = workItemType;
    updateRequest.isProtest = true;
    if (isNdoType == 'add') {
        updateRequest.IsNDO = true;
        isNDOExists = true;
        showNDO(true);
        if (workItemTypeID == 3 || workItemTypeID == '3')
            workItem_Type = 'COM';
        else
            workItem_Type = 'PRT';
        GetNDODetailsById(appId, workItem_Type, workItemTypeID);
    } else if (isNdoType == 'remove') {
        updateRequest.IsNDO = false;
        isNDOExists = false;
        hideNDO();
    }
    //if (isNdoType == 'remove') {
    //    if (!confirm('Are you sure to Remove?')) { ddlActionsObj.selectedIndex = 0; return; }
    //}
    fn_Update_NonDisclosureOrder(updateRequest);
}

function updatecomplaintNDOAttachment() {


    var itemid = $("#hdnApplicationId").val()
    var workItemTypeID = $("#hdnWorkItemTypeIDs").val();
    var workItem_Type = '';
    if (workItemTypeID == 3 || workItemTypeID == '3')
        workItem_Type = 'COM';
    else
        workItem_Type = 'PRT';

    UpdateNDOAttachment(itemid, workItem_Type, workItemTypeID);
}

function updatebopNDOAttachment() {
    var itemid = $("#hdnApplicationId").val()
    UpdateNDOAttachment(itemid, "BOP", 5);
}

/* OA-1197 planning for May142024 release
function modifiedWriteOff() {
    var request = new Object();
    var workItemID = $("#hdnWorkItemID").val();
    var selectedLicenseId = $("#hdnLicenseID").val();
    var reportMonth = $("#hdnReportMonth").val();
    var reportYear = $("#hdnReportYear").val();

    request.WorkItemID = workItemID;
    request.LicenseId = selectedLicenseId;
    request.ReportedYear = reportYear;
    request.ReportedMonth = reportMonth;
    request.Amount = amountDifference.toFixed(2);

    $.ajax({
        type: "POST",
        url: "/ExciseTax/WriteOff",
        contentType: "application/json",
        data: JSON.stringify(request),
        success: function (data) {
            if (data != null) {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show(
                    { message: "Request processed successfully." },
                    "success"
                );
                window.location = "/PrivateUser/PrivateUserDashboard#";
            } else {
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show(
                    { message: "Something went Wrong. Please try again." },
                    "warning"
                );
            }
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show(
                { message: "Something went Wrong. Please try again." },
                "error"
            );
        },
    });
}
*/


// #EndRegion