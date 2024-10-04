$(document).ready(function () {

    if (IsWorkflow == "True") {
        $.Notification.autoHideNotify('custom', 'bottom right', 'WorkFlow Successful', WrkSuccessMsg);
    }
    //GridRefreshOnTileClick();
    var tileName = "";
    $('#divItemsOlder .border-box').css('background-color', '#ffffff');
    $('#divItemsQueue .border-box').css({ 'background-color': '#90A090', 'border-width': '4px', 'color': 'white' });
    $('#valTotalItems').addClass('text-white');
    $('#divReturnedRFIs .border-box').css('background-color', '#ffffff');
    $('#divProcessedtoday .border-box').css('background-color', '#ffffff');
    $('#divOpenRFIs .border-box').css('background-color', '#ffffff');
    $("#divItemsOlder").click(function () {
        tileName = "ItemsOlderThan15Days";              
        $("#TileHeadingName h4").text("Old Items");
        var grid = $("#CommonPrivateDashBoardItems").data("kendoGrid").dataSource.read();        
        GridRefreshOnTileClick(tileName);
        grid.currentPage = 1;
        $('#divItemsOlder .border-box').css({ 'background-color': '#90A090', 'border-width': '4px', 'color': 'white' });
        $('#divItemsQueue .border-box').css({ 'background-color': '#fff', 'border-width': '1px', 'color': 'black' });
        $('#divReturnedRFIs .border-box').css({ 'background-color': '#fff', 'border-width': '1px', 'color': 'black' });
        $('#divProcessedtoday .border-box').css({ 'background-color': '#fff', 'border-width': '1px', 'color': 'black' });
        $('#divOpenRFIs .border-box').css({ 'background-color': '#fff', 'border-width': '1px', 'color': 'black' });
        $("#valOlderItems").addClass("text-white");
        $("#valTotalItems").removeClass("text-white");
        $("#valReturnedRFI").removeClass("text-white");
        $("#valDoneToday").removeClass("text-white");
        $("#valOpenRFI").removeClass("text-white");
        $('#divItemsQueue .border-box').css('background-color', '#ffffff');
        $('#divReturnedRFIs .border-box').css('background-color', '#ffffff');
        $('#divProcessedtoday .border-box').css('background-color', '#ffffff');
        $('#divOpenRFIs .border-box').css('background-color', '#ffffff');
    });
    $("#divItemsQueue").click(function () {        
        tileName = "ItemsInYourQueue";
        $("#TileHeadingName h4").text("Total Items");
        var grid = $("#CommonPrivateDashBoardItems").data("kendoGrid").dataSource.read();
        GridRefreshOnTileClick(tileName);
        grid.currentPage = 1;
        
        $('#divItemsOlder .border-box').css({ 'background-color': '#fff', 'border-width': '1px', 'color': 'black' });
        $('#divItemsQueue .border-box').css({ 'background-color': '#90A090', 'border-width': '4px', 'color': 'white' });
        $('#divReturnedRFIs .border-box').css({ 'background-color': '#fff', 'border-width': '1px', 'color': 'black' });
        $('#divProcessedtoday .border-box').css({ 'background-color': '#fff', 'border-width': '1px', 'color': 'black' });
        $('#divOpenRFIs .border-box').css({ 'background-color': '#fff', 'border-width': '1px', 'color': 'black' });
        $("#valOlderItems").removeClass("text-white");
        $("#valTotalItems").addClass("text-white");
        $("#valReturnedRFI").removeClass("text-white");
        $("#valDoneToday").removeClass("text-white");
        $("#valOpenRFI").removeClass("text-white");
        $('#divItemsOlder .border-box').css('background-color', '#ffffff');
        $('#divReturnedRFIs .border-box').css('background-color', '#ffffff');
        $('#divProcessedtoday .border-box').css('background-color', '#ffffff');
        $('#divOpenRFIs .border-box').css('background-color', '#ffffff');
    });
    $("#divReturnedRFIs").click(function () {
        tileName = "ReturnedRFIs";
        $("#TileHeadingName h4").text("Returned RFIs");
        var grid = $("#CommonPrivateDashBoardItems").data("kendoGrid").dataSource.read();
        GridRefreshOnTileClick(tileName);
        grid.currentPage = 1;
        $('#divItemsOlder .border-box').css({ 'background-color': '#fff', 'border-width': '1px', 'color': 'black' });
        $('#divItemsQueue .border-box').css({ 'background-color': '#fff', 'border-width': '1px', 'color': 'black' });
        $('#divReturnedRFIs .border-box').css({ 'background-color': '#90A090', 'border-width': '4px', 'color': 'white' });
        $('#divProcessedtoday .border-box').css({ 'background-color': '#fff', 'border-width': '1px', 'color': 'black' });
        $('#divOpenRFIs .border-box').css({ 'background-color': '#fff', 'border-width': '1px', 'color': 'black' });
        
        $("#valOlderItems").removeClass("text-white");
        $("#valTotalItems").removeClass("text-white");
        $("#valReturnedRFI").addClass("text-white");
        $("#valDoneToday").removeClass("text-white");
        $("#valOpenRFI").removeClass("text-white");
        $('#divItemsQueue .border-box').css('background-color', '#ffffff');
        $('#divItemsOlder .border-box').css('background-color', '#ffffff');
        $('#divProcessedtoday .border-box').css('background-color', '#ffffff');
        $('#divOpenRFIs .border-box').css('background-color', '#ffffff');
    });
    $("#divProcessedtoday").click(function () {
        $('#divItemsOlder .border-box').css({ 'background-color': '#fff', 'border-width': '1px', 'color': 'black' });
        $('#divItemsQueue .border-box').css({ 'background-color': '#fff', 'border-width': '1px', 'color': 'black' });
        $('#divReturnedRFIs .border-box').css({ 'background-color': '#fff', 'border-width': '1px', 'color': 'black' });
        $('#divProcessedtoday .border-box').css({ 'background-color': '#90A090', 'border-width': '4px', 'color': 'white' });
        $('#divOpenRFIs .border-box').css({ 'background-color': '#fff', 'border-width': '1px', 'color': 'black' });
        $("#valOlderItems").removeClass("text-white");
        $("#valTotalItems").removeClass("text-white");
        $("#valReturnedRFI").removeClass("text-white");
        $("#valDoneToday").addClass("text-white");
        $("#valOpenRFI").removeClass("text-white");
        $('#divItemsQueue .border-box').css('background-color', '#ffffff');
        $('#divItemsOlder .border-box').css('background-color', '#ffffff');
        $('#divReturnedRFIs .border-box').css('background-color', '#ffffff');
        $('#divOpenRFIs .border-box').css('background-color', '#ffffff');
    });
    $("#divOpenRFIs").click(function () {
        $('#divProcessedtoday .border-box').css('background-color', '#ffffff');
        $('#divItemsQueue .border-box').css('background-color', '#ffffff');
        $('#divItemsOlder .border-box').css('background-color', '#ffffff');
        $('#divReturnedRFIs .border-box').css('background-color', '#ffffff');
        $('#divItemsOlder .border-box').css({ 'background-color': '#fff', 'border-width': '1px', 'color': 'b1lack' });
        $('#divItemsQueue .border-box').css({ 'background-color': '#fff', 'border-width': '1px', 'color': 'black' });
        $('#divReturnedRFIs .border-box').css({ 'background-color': '#fff', 'border-width': '1px', 'color': 'black' });
        $('#divProcessedtoday .border-box').css({ 'background-color': '#fff', 'border-width': '1px', 'color': 'black' });
        $('#divOpenRFIs .border-box').css({ 'background-color': '#90A090', 'border-width': '4px', 'color': 'white' });
        $("#valOlderItems").removeClass("text-white");
        $("#valTotalItems").removeClass("text-white");
        $("#valReturnedRFI").removeClass("text-white");
        $("#valDoneToday").removeClass("text-white");
        $("#valOpenRFI").addClass("text-white");
    });

    $("#btnSearch").click(function () {
        $("#loader,.overlay").show();
        window.location.href = "/Apps/AdvanceSearch";
    });

    $("#btnGetMoreWork").click(function () {
        $("#loader,.overlay").show();
        window.location.href = "/workflow/workitemassignment";
    });    

    getWorkItemTypeIdByWorkItemType();
});


function getWorkItemTypeIdByWorkItemType() {
    $.ajax({
        type: "GET",
        dataType: "json",
        url: "/Enforcement/GetWorkItemTypeDetails",
        success: function (data) {
            localStorage.setItem('workItemTypeList', JSON.stringify(data));
            
        },
        error: function (xhr) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went Wrong. Please try again." }, "error");
        },
    });

}

function LicOrRegOrPE(AppType, EncrLicNum, EncrApplicationSubTypeId, LicenseNumber)
{
    
    if (LicenseNumber == "Multiple" || LicenseNumber == "0") {
    }
    else {
        if (AppType == "Registration") {
            window.open("/Registration/WorkFlowRegistrationInfo?id=" + EncrLicNum + "&applicationSubTypeID=" + EncrApplicationSubTypeId+ "&navScr=" + "pvt", '_blank');
        }
        else if (AppType == "License") {
            window.open("/Licensing/WorkFlowLicenseInfo?id=" + EncrLicNum + "&navScr=" + "pvt", '_blank');
        }
        else if (AppType == "Employee") {
            window.open("/Licensing/PawnEmpInfo?pawnEmpId=" + EncrLicNum, '_blank');
        }
        else {
        }
    }
}

function GridRefreshOnTileClick(tileName) {
    $.ajax({
        type: 'POST',
        url: selectCommonPrivateDashBoardItems,
        data: {"TileName": tileName },
        cache: false,
        success: function (data) {
            
            var grid = $("#CommonPrivateDashBoardItems").data("kendoGrid");
            var pass = data.Data;
            var dataSource = new kendo.data.DataSource({ data: pass });
            grid.setDataSource(dataSource);
            grid.dataSource.pageSize(10);
            //var pass = data.Data;
            //grid.dataSource.data(pass);
 
            //grid.dataSource.read();
            //grid.dataSource.pageSize(10);
            //grid.dataSource.pageSize(10);
            //$("#CommonPrivateDashBoardItems").data("kendoGrid").dataSource.pageSize(10);
            //$("#CommonPrivateDashBoardItems").data("kendoGrid").dataSource.read(data);
            ////grid.total = data.total;
            ////[Requirement from Karthik - To display 5 records by default in the grid. So, pageSize is limited to 5. Changed on [05-Feb-2018]].
            //$("#CommonPrivateDashBoardItems").data("kendoGrid").dataSource.pageSize(10);
            ////grid.dataBind(data);
       },
        error: function () {
        }  

    });
}

/* Calling in PrivateUserDashboard page when role is Examiner.*/
/* On WorkItems grid Details when a row is selected. */

function onCommonPVUserWIRowSelected(e) {

    var selectedItem;
    var row = this.select();
    if (row.length > 0) {
        selectedItem = e.sender.dataItem(row);
        var businessType = selectedItem.BusinessType;
    }
    
    if (businessType == "LIC" || businessType == "REG" || businessType == "PEM" || businessType == "MIS" ||
        businessType == "LNK" || businessType == "INV" || businessType == "BOP" || businessType == "EVD" || businessType == "ECS" ||
        businessType == "DIS" || businessType == "DAR" || businessType == "PNY" || businessType == "COM" ||
        businessType == "DSR" || businessType == "PRD" || businessType == "EXC" || businessType == "CLM"
        || businessType == "BSD" || businessType == "ACR" || businessType == "EXT" || businessType == "DFR" || businessType == "INS" || businessType == "ACT") {
        onPVUserWIRowSelected(e);
    }
    else if (businessType == "DOC") {
        onPVUserDFWIRowSelected(e);
    }
    else if (businessType == "COM") {
        onPvUserComplaints(e);
    }
    else if (businessType == "INV") {
        onPvUserInvestigation(e);
    }
    else if (businessType == "INVDOC") {
        onPvUserInvDirecter(e);
    }
    //Commented assuming we are not using this approach. Please check the first "IF" condition for Legal workitem
    //else if (businessType == "LEG") {
    //    onPvUserLegal(e);
    //}
    else if (businessType == "LEGORG") {
        onPvUserLegalOrginator(e);
    }
    else if (businessType == "EXMINI") {
        onPvUserExaminerReviewer(e);
    }
    else if (businessType == "EXMSCH") {
        onPvUserExaminer(e)
    }
    else if (businessType == "ORR") {
        onPvUserAnnDirecter(e)
    }
    else if (businessType == "CAS" || businessType == "LEG") {
        if ((businessType == "CAS" && $("#HasAccessToViewCase").val() == "True") || businessType == "LEG") {
            onPVUserCaseWIRowSelected(e);
        }
        else {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "You don't have permission to access this resource." }, "error");
            return false;
         }
    }
    else {
        onCommonWIRowSelected(e);
    }
}

function onCommonWIRowSelected(e) {
    
    var selectedItem;
    var row = e.sender.select();
    if (row.length > 0) {
        selectedItem = e.sender.dataItem(row);
        var appId = selectedItem.ApplicationId;
        var type = selectedItem.BusinessType;
        var workitemId = selectedItem.WorkItemId;
        var workItemTypeID = selectedItem.WorkItemTypeId;
    }
    $("#loader,.overlay").show();
    window.location = "/process/WorkFLow?WorkitemID=" + workitemId + "&WorkitemTypeID=" + workItemTypeID + "&WorkitemType=" + type + "&ApplicationID=" + appId;
}

function onPLAT_WIRowSelected(e) {
    
    var selectedItem;
    var row = e.sender.select();
    if (row.length > 0) {
        selectedItem = e.sender.dataItem(row);
        var appId = selectedItem.ApplicationId;
        var type = selectedItem.BusinessType;
        var workitemId = selectedItem.WorkItemId;
        var workItemTypeID = selectedItem.WorkItemTypeId;
    }
    $("#loader,.overlay").show();
    window.location = "/process/PLAT_WorkFLow?WorkitemID=" + workitemId + "&WorkitemTypeID=" + workItemTypeID + "&WorkitemType=" + type + "&ApplicationID=" + appId;
}

function onPVUserCaseWIRowSelected(e) {
    var selectedItem;
    var row = e.sender.select();
    if (row.length > 0) {
        selectedItem = e.sender.dataItem(row);
        var appId = selectedItem.ApplicationId;
        var type = selectedItem.BusinessType;
        var uniqueId = selectedItem.WorkItemId;
        var typeId = selectedItem.BusinessTypeID;
        var workitemId = selectedItem.WorkItemId;
        var workItemTypeID = selectedItem.WorkItemTypeId;
    }
    $("#loader,.overlay").show(); 
    window.location = "/process/InvCaseworkflow?WorkitemID=" + workitemId + "&WorkitemTypeID=" + workItemTypeID + "&WorkitemType=" + type +"&ApplicationID=" + appId;
}

function onPVUserWIRowSelected(e) {
    var selectedItem;
    var row = e.sender.select();
    if (row.length > 0) {
        selectedItem = e.sender.dataItem(row);
        var appId = selectedItem.ApplicationId;
        var type = selectedItem.BusinessType;
        var uniqueId = selectedItem.WorkItemId;
        var typeId = selectedItem.BusinessTypeID;
        var workitemId = selectedItem.WorkItemId;
        var workItemTypeID = selectedItem.WorkItemTypeId;
    }
    $("#loader,.overlay").show();
    window.location = "/process/workflow?WorkitemID=" + workitemId + "&WorkitemTypeID=" + workItemTypeID + "&WorkitemType=" + type;
}

function onPVUserDFWIRowSelected(e) {
    
    var selectedItem;
    var row = e.sender.select;
    if (row.length > 0) {
        selectedItem = e.sender.dataItem(row);
        var appId = selectedItem.ApplicationId;
        var type = selectedItem.BusinessType;
        var uniqueId = selectedItem.UniqueId;
        var typeId = selectedItem.BusinessTypeID;
    }
    $("#loader,.overlay").show();
    window.location = "/workflow/workflow?Id=" + uniqueId + "&workitemtypeId=" + typeId;
}
function onPvUserComplaints(e) {
    
    var selectedItem;
    var row = e.sender.select();
    if (row.length > 0) {
        selectedItem = e.sender.dataItem(row);
        var uniqueId = selectedItem.UniqueId;
        var businessType = selectedItem.BusinessType;
        var ModeType = selectedItem.InvModeType;
        var InvUserType = selectedItem.InvUserTypeOR;
        var InvestigationID = selectedItem.InvestigationId;
        var type = selectedItem.BusinessType;
        var typeId = selectedItem.BusinessTypeID
    }
    //var uniqueId = e.row.cells[19].innerHTML;
    //var businessType = e.row.cells[36].innerHTML;
    //var ModeType = e.row.cells[22].innerHTML;
    //var InvUserType = e.row.cells[28].innerHTML;
    //var InvestigationID = e.row.cells[14].innerHTML;
    //var type = e.row.cells[36].innerHTML;
    //var typeId = e.row.cells[41].innerHTML;

    if (businessType == "Inv") {
        $("#loader,.overlay").show();
        window.location = "/workflow/workflow?Id=" + uniqueId + "&workitemtypeId=" + typeId;
    } else {
        $("#loader,.overlay").show();
        window.location = "/workflow/workflow?Id=" + uniqueId + "&workitemtypeId=" + typeId;
    }
}

//Redirect to investgation eavalution
function onPvUserInvestigation(e) {
    
    var selectedItem;
    var row = e.sender.select();
    if (row.length > 0) {
        selectedItem = e.sender.dataItem(row);
        var businessType = selectedItem.BusinessType;
        var uniqueId = selectedItem.UniqueId;
        var typeId = selectedItem.BusinessTypeID;
        var ModeType = null;
        var InvUserType = null;
        var IsSucess = null;
        var InvEncrpUserType = null;
        var IsEicInvestigator = false;
        if (businessType == "INV") {
            InvUserType = selectedItem.InvUserType;
            ModeType = selectedItem.ModeType;
            IsSucess = selectedItem.IsSucess;
            InvEncrpUserType = selectedItem.InvEncrpUserType;
            IsEicInvestigator = selectedItem.IsEICInvestigator;
        }
    }
    //var uniqueId = e.row.cells[36].innerHTML;
    //var InvUserType = e.row.cells[1].innerHTML;
    //window.location = "/Investigation/InvestigationWorkItemEvaluation?invID=" + uniqueId + "&invUserType=" + InvUserType;
    //var businessType = e.row.cells[36].innerHTML;
    //var uniqueId = e.row.cells[19].innerHTML;
    //var typeId = e.row.cells[41].innerHTML;
    //var ModeType=null;
    //var InvUserType = null;
    //var IsSucess = null;
    //var InvEncrpUserType = null;
    //var IsEicInvestigator = false;
    //if (businessType == "INV") {
    //    InvUserType = e.row.cells[16].innerHTML;
    //    ModeType = e.row.cells[20].innerHTML;
    //    IsSucess = e.row.cells[21].innerHTML;
    //    InvEncrpUserType = e.row.cells[23].innerHTML;
    //    IsEicInvestigator = e.row.cells[15].innerHTML;
    //}
    if (businessType == "INVDIR") {
        ModeType = selectedItem.InvModeType;
        //ModeType = e.row.cells[22].innerHTML;
        InvUserType = selectedItem.InvUserTypeInvD;
        //InvUserType = e.row.cells[29].innerHTML;
    }
    if (businessType == "INVRES") {
        ModeType = selectedItem.ModeTypeISEICInv;
        //ModeType = e.row.cells[34].innerHTML;
        InvUserType = selectedItem.InvUserTypeIsEICInv;
        //InvUserType = e.row.cells[30].innerHTML;
        IsSucessselectedItem.IsSucessIsEICInv;
        //IsSucess = e.row.cells[35].innerHTML;
    }
    //if (businessType == "INVDOC") {

    //    InvUserType = e.row.cells[31].innerHTML;
    //}
    
    if (InvUserType == 'InvManger') {
        $("#loader,.overlay").show();
        window.location = "/workflow/workflow?Id=" + uniqueId + "&workitemtypeId=" + typeId + "&invUserType=" + InvUserType;

    } else if (InvUserType == 'InvDirecter' || InvUserType == 'InvInvestigatorResponse') {
        $("#loader,.overlay").show();
        window.location = "/workflow/workflow?Id=" + uniqueId + "&workitemtypeId=" + typeId + "&invUserType=" + InvUserType;
    } else if (InvUserType == 'InvAssitingInvestigatorResponse' && IsEicInvestigator == 'false') {
        $("#loader,.overlay").show();
        window.location = "/workflow/workflow?Id=" + uniqueId + "&workitemtypeId=" + typeId + "&invUserType=" + InvUserType;
    }
    else if (InvUserType == 'InvOriginatorResponse' || InvUserType == '') {
        $("#loader,.overlay").show();
        window.location = "/workflow/workflow?Id=" + uniqueId + "&workitemtypeId=" + typeId + "&invUserType=" + InvUserType;
    }

}

//Investigation Directer work item evaluation
function onPvUserInvDirecter(e) {
    var selectedItem;
    var row = e.sender.select();
    if (row.length > 0) {
        selectedItem = e.sender.dataItem(row);
        var businessType = selectedItem.BusinessType;
        var uniqueId = selectedItem.UniqueId;
        var ModeType = selectedItem.ModeType;
        var InvUserType = selectedItem.InvUserTypeInvDocFee;
        var IsSucess = selectedItem.IsSucess;
        var IsEicInvestigator = selectedItem.IsEICInvestigator;
        var typeId = selectedItem.BusinessTypeID;
    }
    //var businessType = e.row.cells[36].innerHTML;
    //var uniqueId = e.row.cells[19].innerHTML;
    //var ModeType = e.row.cells[20].innerHTML;
    //var InvUserType = e.row.cells[31].innerHTML;
    //var IsSucess = e.row.cells[21].innerHTML;
    //var IsEicInvestigator = e.row.cells[15].innerHTML;
    //var typeId = e.row.cells[41].innerHTML;
    if (IsEicInvestigator == 'false') {
        $("#loader,.overlay").show();
        window.location = "/workflow/workflow?Id=" + uniqueId + "&workitemtypeId=" + typeId;
    } else {
        $("#loader,.overlay").show();
        window.location = "/workflow/workflow?Id=" + uniqueId + "&workitemtypeId=" + typeId;
    }
    
}

//Legal WorkItem in dashboard

function onPvUserLegal(e) {
    var selectedItem;
    var row = e.sender.select();
    if (row.length > 0) {
        selectedItem = e.sender.dataItem(row);
        var LegID = selectedItem.LegID;
        var businessType = selectedItem.BusinessType;
        var typeId = selectedItem.BusinessTypeID;
    }
    $("#loader,.overlay").show();
    window.location = "/workflow/workflow?Id=" + LegID + "&workitemtypeId=" + typeId;
}

function onPvUserLegalOrginator(e) {
    var selectedItem;
    var row = e.sender.select();
    if (row.length > 0) {
        selectedItem = e.sender.dataItem(row);
        var legappid = selectedItem.EncrLegalApplicationTransactionID;
        var businessType = selectedItem.BusinessType;
        var typeId = selectedItem.BusinessTypeID;
    }
    $("#loader,.overlay").show();
    window.location = "/workflow/workflow?Id=" + legappid + "&workitemtypeId=" + typeId;
}


function onPvUserExaminerReviewer(e) {
    var selectedItem;
    var row = e.sender.select();
    if (row.length > 0) {
        selectedItem = e.sender.dataItem(row);
        var uniqueId = selectedItem.UniqueId;
        var typeId = selectedItem.BusinessTypeID;
    }
    $("#loader,.overlay").show();
    window.location = "/workflow/workflow?Id=" + uniqueId + "&workitemtypeId=" + typeId;
}


function onPvUserExaminer(e) {
    var selectedItem;
    var row = e.sender.select();
    if (row.length > 0) {
        selectedItem = e.sender.dataItem(row);
        var uniqueId = selectedItem.UniqueId;
        var isEicCheck = selectedItem.IsEic;
        var typeId = selectedItem.BusinessTypeID;
    }
    $("#loader,.overlay").show();
    window.location = "/workflow/workflow?Id=" + uniqueId + "&workitemtypeId=" + typeId;



}
//Redirect to investgation eavalution
function onPvUserAnnDirecter(e) {
    var selectedItem;
    var row = e.sender.select();
    if (row.length > 0) {
         selectedItem = e.sender.dataItem(row);
        var uniqueId = selectedItem.UniqueId;
        var workItemType = selectedItem.EncrWorkitemType;
        var typeId = selectedItem.BusinessTypeID;
    }
    $("#loader,.overlay").show();
    window.location = "/workflow/workflow?Id=" + uniqueId + "&workitemtypeId=" + typeId;
}

/* Calling in PrivateUserDashboard page when role is Examiner.*/

function onRowBound(e) {
    var row = e.row;
    $(row).attr('title', 'Click here to process the request');
}










//function Investigation(e) {
//    var uniqueId = e.row.cells[36].innerHTML;
//    window.location = "/workflow/WorkFlowEvaluation?Id=" + uniqueId;
//    //window.location = "/workflow/ComplaintsWorkItemDetails?Id=" + uniqueId;
//}



/* Calling in PrivateUserDashboard page when role is Examiner.*/
/* When EscalatedComplaintFeedbackNumber hyperlink is clicked.*/
function OnFileSelected(EscalatedComplaintFeedbackId, EscalatedItemAssignmentId, EscalatedItemAssignmentDetailsId) {

    $('#hdnEsaclatedComplaintFeedbackId').val(EscalatedComplaintFeedbackId);

    $('#hdnEsaclatedItemAssignmentId').val(EscalatedItemAssignmentId);

    $('#hdnEscalatedItemAssignmentDetailsId').val(EscalatedItemAssignmentDetailsId)



    $('#frmComplaintFeedback').submit();
    $("#loader,.overlay").show();
    window.location = "/Inspection/AnsweringQuestionsByExaminer/?EncrEscalatedComplaintFeedbackId=" + EscalatedComplaintFeedbackId + '&EncrEscalatedItemAssigmentId=' + EscalatedItemAssignmentId + '&EncrEscalatedItemAssignmentDetailsId=' + EscalatedItemAssignmentDetailsId;
}

/* Calling in PrivateUserDashboard page when role is Examiner.*/
/* On NewRequests,Draft,Submit,RFI grid Details when a row is selected binding assigned members grid. */
function BindReadOnlyGrid(trackingId, isExam) {

    isExam = false;

    $.ajax({
        type: 'POST',
        url: FeedbackListGrid,
        data: { "TrackingId": trackingId, "IsExam": isExam },
        //headers: header,
        cache: false,
        success: function (data) {
           
            var grid = $("#grdcomplaintfeedbacklist").data("kendoGrid");
            var totalRecords = grid.dataSource.total();
            //grid.total = data.length;
            //grid.dataSource.read();
            var pass = data.Data;
            grid.dataSource.data(pass);
            //grid.dataBind(data);
            if (totalRecords > 0) {
                $("#divReadOnlyGrid").show();

                $("#grdcomplaintfeedbacklist").show();
            }
            else { $("#divReadOnlyGrid").hide(); }
        },
        error: function () {

        }
    });
}
function onExtensionGridRowSelected(e) {
    
    var selectedItem;
    var row = e.sender.select();
    if (row.length > 0) {
        selectedItem = e.sender.dataItem(row);
        var extensionId = selectedItem.ExtensionId;
        var extensionShortName = selectedItem.ExtensionShortName;
        var typeOfExtension = selectedItem.ExtenstionType;
        var extensionDays = selectedItem.ExtensionDays;
        var extensionStartDate = ConvertTodate(selectedItem.strExtensionStartDate); //ExtensionStartDate "Added By Pedram"
        var extensionEndDate = ConvertTodate(selectedItem.strExtensionEndDate);// ExtensionEndDate  "Added By Pedram"
        var description = selectedItem.ExtensionReason;

        $('#lblShortName').html(extensionShortName);
        $('#lblTypeOfExtension').html(typeOfExtension);
        $('#lblExtendedDays').html(extensionDays);
        $('#lblStartDate').html(extensionStartDate);
        $('#lblEndDate').html(extensionEndDate);
        $('#lblDescription').html(description);

        GetLicenseDetailByExtensionId(extensionId);
    }
    //window.location = "/PrivateUser/GetExtensionById?ExtensionId=" + extensionId;
}

function ConvertTodate(dateVal) {
    var date = new Date(dateVal),
        yr = date.getFullYear(),
        month = (1 + date.getMonth()) < 10 ? '0' + (1 + date.getMonth()) : (1 + date.getMonth()),
        day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate(),
        newDate = month + '-' + day + '-' +yr;
    return newDate;
}

