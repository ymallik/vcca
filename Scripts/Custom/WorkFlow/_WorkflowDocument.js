
var isFileUploaded = false;

/* Calling in _WorkflowDocuments.cshtml partial view */

$(document).ready(function () {
    $(".k-status").hide();
    let WorkItemTypeNew = '';
    try {
        WorkItemTypeNew = WorkItemType;
    }
    catch(err) {
        WorkItemTypeNew = '';
    }
    if (WorkItemTypeNew != getWorkItemTypes.WorkItemType3 && WorkItemTypeNew != getWorkItemTypes.WorkItemType4 && WorkItemTypeNew != getWorkItemTypes.WorkItemType2
        && WorkItemTypeNew != getWorkItemTypes.WorkItemType1 && WorkItemTypeNew != getWorkItemTypes.WorkItemType5) {
        if (WorkItemTypeNew == 'LEG') { return; } // TO hide the Add Document panel in LEG.
        $("#addDocumentsbtn_view").show();
    }
    else {
        $("#addDocumentsbtn_view").hide();
    }
    $('#DocumentHistoryGrid .k-refresh').click(function () {

        var grid = $("#DocumentHistoryGrid").data('kendoGrid');

        $.ajax({
            type: "POST",
            url: '/Proccess/GetWorkFlowDocumentsHistory',

            dataType: "json",

            cache: false,
            beforeSend: function () {
                showBlockedMask();
                $("#DocumentHistoryGrid .k-grid-bottom .k-status a").addClass("k-loading");
                grid.total = 0;
                grid.dataSource.data(null);
            },

            success: function (data) {
                hideBlockedMask()
                $("#DocumentHistoryGrid .k-grid-bottom .k-status a").removeClass("k-loading");

                CurrentSearchSelection = data;
                var grid = $("#DocumentHistoryGrid").data("kendoGrid");
                var dataSource = grid.dataSource;
                var recordsOnCurrentView = dataSource.view().length;
                var totalRecords = dataSource.total();
                //grid.total = data.length;
                if (totalRecords > 0) {
                }
                else {

                }
                var pass = data.Data;
                grid.dataSource.data(pass);
                //grid.dataBind(data);
                lookupLicenseData = data;
            },
            error: function () {
            }
        });
    });

    $("#docHistoryDownloadAll").click(function () {

        var grid = $("#DocumentHistoryGrid").data("kendoGrid");
        var dataSource = grid.dataSource;
        var recordsOnCurrentView = dataSource.view().length;
        var totalRecords = dataSource.total();
        if (totalRecords == undefined || totalRecords == "" || totalRecords == 0) {
            $('#docHistoryerror').css('display', 'block');
            return false;
        }
        else {
            window.location.href = "/Apps/DownloadAllBlobDocuments?ApplicationId=" + ApplicationId + "&WorkItemType=" + WorkItemType;
            $('#docHistoryerror').css('display', 'none');
        }
    });
});

/* Calling in _WorkflowDocuments.cshtml partial view */
/* On File selected to upload */
function onUpload(e) {
    if (document.getElementById('CanPubliUserView')  && document.getElementById('CanPubliUserView').checked)
        e.data = { documentNote: $("#txtNote").val(), CanPubliUserView: $("#CanPubliUserView").val() };
    else
        e.data = { documentNote: $("#txtNote").val() };

    isFileUploaded = true;

}
function onUploadFolder(e) {
    e.data = { documentNote: $("#txtNote").val(), FolderName: $("#txtFolderName").val() + "|" + $("#ApplicationId").val() };
    isFileUploaded = true;
}

function OnAttach(e) {
    var files = e.files;
    var bytesPerMB = 1048576;

    $.each(files, function () {
        var popupNotification = $("#Notification").data("kendoNotification");

        if (WorkItemType && WorkItemType == 'LEG') {
            if (!OnUploadMaxFileExtensions(this.extension)) {
                popupNotification.show({ message: "Please upload .zip/.mov/.mp4/.m4v/.wmv/.flv/.avi/.mts/.mkv/.webm/.mpeg/.m4a/.pdf/.doc/.docx/.xls/.xlsx/.mp3/.wav/.aiff/.m4a/.jpg/.jpeg/.png/.svg." }, "error");
                e.preventDefault();
                return false;

            }
            else if (CheckFileLength(this.name) == false) {
                popupNotification.show({ message: "FileName is greater than 80 Characters in length!" }, "error");
                e.preventDefault();
                return false;
            }
            else if (this.size && (this.size > 1024 * bytesPerMB)) {
                popupNotification.show({ message: "File is greater than 1GB in size." }, "error");
                e.preventDefault();
                return false;
            }
            else {

            }
        }
        else if (WorkItemType && WorkItemType == 'CAS') {
            if (!OnUploadMaxFileExtensions(this.extension)) {
                popupNotification.show({ message: "Please upload .pdf/.doc/.docx/.xls/.xlsx/.csv/.jpg/.jpeg/.png." }, "error");
                e.preventDefault();
                return false;

            }
            else if (CheckFileLength(this.name) == false) {
                popupNotification.show({ message: "FileName is greater than 80 Characters in length!" }, "error");
                e.preventDefault();
                return false;
            }
            else if (this.size && (this.size > 5 * bytesPerMB)) {
                popupNotification.show({ message: "File is greater than 5 MB in size." }, "error");
                e.preventDefault();
                return false;
            }
            else {

            }
        }
        else {
            if (!OnUploadFileExtensions(this.extension)) {
                popupNotification.show({ message: "Please upload .pdf/.doc/.docx/.xls/.xlsx." }, "error");
                e.preventDefault();
                return false;
            }
            else if (CheckFileLength(this.name) == false) {
                popupNotification.show({ message: "FileName is greater than 80 Characters in length!" }, "error");
                e.preventDefault();
                return false;
            }
            else if (this.size && (this.size > 5 * bytesPerMB)) {
                popupNotification.show({ message: "File is greater than 5 MB in size." }, "error");
                e.preventDefault();
                return false;
            }
            else {

            }
        }
       
    });

}

/* Calling in _WorkflowDocuments.cshtml partial view */
/* To Fill the document history grid with details */

function FillDocumentGrid(e) {
    
    var internalIspublic = false;
    if (isPublic) {
        internalIspublic = true;
    }
    $(".k-upload-files").remove();
    $(".k-upload-status").remove();
    $(".k-upload.k-header").addClass("k-upload-empty");
    $(".k - dropzone - hint").remove();
    $(".k-upload-button").removeClass("k-state-focused");
    // $(".t-upload-files").hide();
    $(".HistoryFileUpload .k-files").hide();
    var parameters = {
        "workItemId": WorkItemItemId, "workItemType": WorkItemType, "documentType": documentType, "isPublic": internalIspublic, "folderName": folderName}
    CallMethodWithHeader('POST', getDocumentsHistory, parameters, headers, onSuccess);
    function onSuccess(data) {
        var grid = $("#DocumentHistoryGrid").data("kendoGrid");
        //grid.total = data.total;
        //grid.dataBind(data);
        var pass = data.Data;
        grid.dataSource.data(pass);
        $('#txtNote').val('');
    }
}

function FillDeficiencyDocumentGrid(e) {
    
    $(".k-upload-files").remove();
    $(".k-upload-status").remove();
    $(".k-upload.k-header").addClass("k-upload-empty");
    $(".k - dropzone - hint").remove();
    $(".k-upload-button").removeClass("k-state-focused");
    // $(".t-upload-files").hide();
    $(".HistoryFileUpload .k-files").hide();
    var parameters = { "deficiencyID": 0 }
    CallMethodWithHeader('POST', getRFIDocuments, parameters, headers, onSuccess);
    function onSuccess(data) {
        var grid = $("#DocumentHistoryGrid").data("kendoGrid");
        //grid.total = data.total;
        //grid.dataBind(data);
        var pass = data.Data;
        grid.dataSource.data(pass);
    }
}

function DeletWorkFlowDocument(fileId) {
    var workItemItemId = $("#hdnWorkItemID").val();
    if (confirm("Are you sure to delete this Document?")) {
        $.ajax({
            type: 'POST',
            url: "/Process/DeletWorkFlowDocument",
            data: { "fileID": fileId, "workItemItemId": workItemItemId },
            cache: false,
            success: function (data) {
                $('#DocumentHistoryGrid').data('kendoGrid').dataSource.read();
                $('#DocumentHistoryGrid').data('kendoGrid').refresh();
                var popupNotification = $("#Notification").data("kendoNotification");
                popupNotification.show({ message: "Document has been deleted successfully." }, "success");
                FillWorkDocumentGrid('');
            },
            error: {

            }
        });
    }

}


function redirect_AddDocuments() {
    if (document.getElementById('dvDocumentHistoryUpload') != null)
        document.getElementById('dvDocumentHistoryUpload').classList.remove("hidden");
    if (document.getElementById('addDocumentsbtn_view') != null)
        document.getElementById('addDocumentsbtn_view').classList.add("hidden");
    if (document.getElementById('documnetsGrid') != null)
        document.getElementById('documnetsGrid').classList.add("hidden");
    

}

function resetDocument() {
    if (document.getElementById('dvDocumentHistoryUpload') != null)
        document.getElementById('dvDocumentHistoryUpload').classList.add("hidden");
    if (document.getElementById('addDocumentsbtn_view') != null)
        document.getElementById('addDocumentsbtn_view').classList.remove("hidden");
    if (document.getElementById('documnetsGrid') != null)
        document.getElementById('documnetsGrid').classList.remove("hidden");

}



function FillLICDocumentGrid() {
    
    var internalIspublic = false;
    if (isPublic) {
        internalIspublic = true;
    }
    $(".k-upload-files").remove();
    $(".k-upload-status").remove();
    $(".k-upload.k-header").addClass("k-upload-empty");
    $(".k - dropzone - hint").remove();
    $(".k-upload-button").removeClass("k-state-focused");
    // $(".t-upload-files").hide();
    $(".HistoryFileUpload .k-files").hide();
    
    var parameters = {
        "workItemId": WorkItemItemId, "workItemType": WorkItemType, "documentType": documentType, "isPublic": internalIspublic
    }
    CallMethodWithHeader('POST', getDocumentsHistory, parameters, headers, onSuccess);
    function onSuccess(data) {
        
        if (document.getElementById('dvDocumentHistoryUpload') != null)
            document.getElementById('dvDocumentHistoryUpload').classList.add("hidden");
        if (document.getElementById('addDocumentsbtn_view') != null)
            document.getElementById('addDocumentsbtn_view').classList.remove("hidden");
        if (document.getElementById('documnetsGrid') != null)
            document.getElementById('documnetsGrid').classList.remove("hidden");
        var grid = $("#DocumentHistoryGrid").data("kendoGrid");
        //grid.total = data.total;
        //grid.dataBind(data);
        var pass = data.Data;
        grid.dataSource.data(pass);
       
    }
}

function onDocumentSave() {
    var popupNotification = $("#Notification").data("kendoNotification"); 
 
    if (isFileUploaded) {
        FillWorkDocumentGrid('');
        popupNotification.show({ message: "Document Saved successfully." }, "success");
    }
    else
        alert("Please attach a document");
    isFileUploaded = false;
     //this upload implementation designed in a different way (plz check upload feature), So that is the reason we are showing success message in this way.-EGIS-1723

}

