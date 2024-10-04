
/* Calling in _WorkflowDocuments.cshtml partial view */

$(document).ready(function () {
    $(".k-status").hide();
   
    $('#DocumentHistoryGrid .k-refresh').click(function () {
        
        var grid = $("#DocumentHistoryGrid").data('kendoGrid');

        $.ajax({
            type: "POST",
            url: '/Apps/GetDeficiencyDocuments',

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
            window.location.href = "/Apps/DownloadAllBlobDocuments?ApplicationId=" + ApplicationId+ "&WorkItemType=" + WorkItemType;
            $('#docHistoryerror').css('display', 'none');
        }
    });
});

/* Calling in _WorkflowDocuments.cshtml partial view */
/* On File selected to upload */
function onUpload(e) {
    e.data = { documentNote: $("#txtNote").val() };
}
function OnAttach(e) {
    
    var files = e.files;
    var bytesPerMB = 1048576;

    $.each(files, function () {
        var popupNotification = $("#Notification").data("kendoNotification");
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
    });
}

/* Calling in _WorkflowDocuments.cshtml partial view */
/* To Fill the document history grid with details */
function FillDocumentGrid(e) {

    $(".k-upload-files").remove();
    $(".k-upload-status").remove();
    $(".k-upload.k-header").addClass("k-upload-empty");
    $(".k - dropzone - hint").remove();
    $(".k-upload-button").removeClass("k-state-focused");
    // $(".t-upload-files").hide();
    $(".HistoryFileUpload .k-files").hide();
    var parameters = { "encMultipleDefId": encMultipleDeficiencyId, "isPublicUploadedBy": true}
    CallMethodWithHeader('POST', getDefDocumentsHistory, parameters, headers, onSuccess);
    function onSuccess(data) {
        var grid = $("#DocumentHistoryGrid").data("kendoGrid");
        //grid.total = data.total;
        //grid.dataBind(data);
        var pass = data.Data;
        grid.dataSource.data(pass);
        $('#txtNote').val('');
    }
}

function RemoveDeficiecnyDocument_Click(e) {
    var grid = $("#DocumentHistoryGrid").data("kendoGrid");
    modelToResend = grid.dataItem($(e.target).parents('tr'));
    e.preventDefault();
    $.ajax({
        type: 'POST',
        url: '/Apps/RemoveDeficiencyDocument',
        data: { "deficiencyDocumentId": modelToResend.DeficiencyDocumentId },
        //headers: { 'RequestVerificationToken': '@Gov2Biz.WebUI.Helper.ValidateAjaxAntiForgeryToken.TokenHeaderValue()' },
        cache: false,
        success: function (data) {
            
            if (data = 'success') {
                var popupNotification = $("#resendSuccessNotification").data("kendoNotification");
                popupNotification.show({ message: "Removed document successfully." }, "success");
                FillDocumentGrid(null);
            }

        },
        error: function (er) {
            var popupNotification = $("#resendFailNotification").data("kendoNotification");
            popupNotification.show({ message: "Something went wrong, please try again." }, "error");
        }
    });
    
} 