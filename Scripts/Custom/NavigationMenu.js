function LoadNotifications() {

    $.ajax({
        type: 'POST',
        url: urlNotifications,
        data: { profileId: 197 },
        headers: { 'RequestVerificationToken': headerContentData },
        cache: false,
        success: function (data) {
     
            var notificationscount = data.Count;
            var loopcounter = 1;
            if (data.result.length>0) {
                $.each(data.result, function (key, value) {
                    if (loopcounter <= 4) {
                        var linkLi = document.createElement('li');
                        var NotificationsDesc = add3Dots(value.NotificationsDesc, 200);
                        $(linkLi).append('<h6>' + value.NotificationsTitle + '</h6><p class="alert-text headline"><a href="">' + NotificationsDesc + '</p>');


                        //var htitle = document.createElement('h6');
                        //$(htitle).attr("value", value.NotificationsTitle);

                        //var pelement = document.createElement('p');
                        // $(pelement).attr("class", "alert-text headline");
                        //// $(linkLi).appendTo(pelement);

                        // var anchorelement = document.createElement('a');
                        // $(anchorelement).attr("value", value.NotificationsDesc);
                        // $(pelement).appendTo(anchorelement);

                        //  $(linkLi).appendTo(htitle);
                        // $(linkLi).appendTo(pelement);

                        //Appending li to the ui
                        $(linkLi).appendTo('#NotificationAlerts');
                        loopcounter = loopcounter + 1;
                    }
                })
                $('#NotificationAlerts').append('<li><a href="#">More....</a></li>');
            }
            else {
                $('#NotificationAlerts').append('<li>No Alerts</li>');
            }
            $('#Notifications').append('<span class="label label-warning">' + notificationscount + '</span>');

            //$("#NotificationAlerts #navigation a").each(function () {
            //    if (this.href == window.location.href) {
            //        $(this).addClass("subdrop");
            //        if ($("#NotificationAlerts #navigation  a").hasClass("subdrop")) {
            //            $(this).parents("ul").prev('a').addClass('subdrop');

            //            $(this).parents("ul").css("display", "block")
            //        }
            //    }
            //});

        },
        error: function (objError) {
            alert(objError.responseText);
        }
    });
}

function disPlayNotExistMessage(message) {
    $('#divNoRecordFoundMessage').show();
    $('#divNoRecordFoundMessage').html(message);
    setTimeout(function () {
        var selectedEffect = 'blind';
        var options = {};
        $("#divNoRecordFoundMessage").hide(selectedEffect, options, 500)
    }, 5000);
}

function LoadMenu() {
    
    $.ajax({
        type: 'POST',
        url: urlPermissionsAndNavigations,
        data: { profileId: 197 },
        headers: { 'RequestVerificationToken': headerContentData },
        cache: false,
        success: function (result) {
         


            //var navigationDiv = document.createElement('div');
            //$(navigationDiv).attr("id", "main");
            //$(navigationDiv).attr("style", "margin-bottom: 1em;");
         
            //var mainUi = document.createElement('ul');
            //$(mainUi).attr("id", "navigation");
            //$(mainUi).attr("class", "dropdown-menu mega-dropdown-menu row");
           

           // var loopCount = 1;

            $.each(result, function (key, value) {
                //console.log("result = ", result);
                var linkLi = document.createElement('li');
                $(linkLi).attr("class", "col-sm-2 col-xs-6");
                linkLi = navigationLinkCretaion(linkLi, value.Url, value.Data_n, value.Name, false, value.ChileElement.length);
                if (value.ChileElement != null && value.ChileElement.length > 0) {
                   
                }

               // creating sub Elements
                if (value.ChileElement != null && value.ChileElement.length > 0) {
                   
                    var subUi = document.createElement('ul');
                    $(subUi).append('<li class=" m-t-70"> <a href="#" class="closemeghamenu col-xs-12">  x Close </a> </li>');
                    $(subUi).attr("class", "mega-dropdown-submenu");
                 
                    //$(subUi).attr("style", "height: auto !important");
                    //$(subUi).attr("style", "display:none;");
                    var isUiNeedShow = false;
                  

                    $.each(value.ChileElement, function (subKey, subValue) {
                        var subLi = document.createElement('li');
                        $(subLi).attr("class", "col-sm-2 col-xs-6");
                        subLi = navigationLinkCretaion(subLi, subValue.Url, subValue.Data_n, subValue.Name, true);
                        $(subLi).appendTo(subUi);
                        $(subUi).appendTo(linkLi);
                        var currurl = window.location.pathname;
                        var index = currurl.lastIndexOf("/") + 1;
                        var filename = currurl.substr(index);

                        var subUrl = subValue.Url;
                        var subindex = subUrl.lastIndexOf("/") + 1;
                        var subfilename = subUrl.substr(subindex);

                        var currentFolder = currurl.substring(0, currurl.lastIndexOf('/')).replace("/", "");
                        //var subFolder = value.Url.substring(0, value.Url.lastIndexOf('/')).replace("/", "");
                        var subFolder = subValue.Url.substring(0, value.Url.lastIndexOf('/')).replace("/", "");
                        //alert(subFolder);

                       // if ((subfilename == filename || (filename == 'Index' && (subfilename == 'Index' || subfilename == 'AllFlexReports' || subfilename == 'AllInvestigationReports' || subfilename == 'AnnualReportHome'))) && (currentFolder == subFolder || subFolder == 'AnnualR')) {
                        //if (subLi)
                        //{
                           // alert(12);
                            //alert(subfilename);
                          //  isUiNeedShow = true;
                       // }
                    });
                    //if (isUiNeedShow) {
                    //    $(subUi).show();
                    //    $(subUi).attr("class", "mega-dropdown-submenu");
                      
                       
                    //}
                    //else {
                        $(subUi).hide();
                   // }


                }
             
                //Appending li to the ui
                $(linkLi).appendTo('#main');
                //$('.#main > li > a').click(function () {
                    
                //    $(this).attr('href', '#');
                //})

                //$('#main > li:hover >  ul').css('display', 'block !important');
            })

            //Appending ul to div
//$(mainUi).appendTo('#main');



            //appending div to main navigation div
            //jQuery(navigationDiv, {
            //    style: 'margin-bottom: 1em;'
            //}).appendTo('#main');
            $("#dummyMain").css("display", "none");
           
            //$("#main #navigation a").addClass("subdrop");
            $("#main #navigation a").each(function () {
                if (this.href == window.location.href) {
                    $(this).addClass("subdrop");
                    if ($("#main #navigation  a").hasClass("subdrop")) {
                        $(this).parents("ul").prev('a').addClass('subdrop');

                        $(this).parents("ul").css("display", "block")
                    }
                }
            });

            $(document).ready(function () {
                

                //$("#navigation").accordion("refresh");

                //reloadingIcons();
                $(".closemeghamenu").click(function () {

                    $('.mega-dropdown-submenu').hide();
                });
            });



        },
        error: function (objError) {
            alert(objError.responseText);
        }
    });
}
function navigationLinkCretaion(linkLi, url, Data_n, Name, isChildSpan,ChileElementLength) {

    //creating anchor link
    var linka = document.createElement('a');
    if (!isChildSpan) {
        //$(linka).attr("class", "head waves-effect waves-primary");
    }
    if (ChileElementLength>0) {
        $(linka).attr("href", "javascript:void(0);")
   .appendTo(linkLi);
        

    }
    else {
        $(linka).attr("href", url)
   .appendTo(linkLi);

   }
  

    //creating the icon
    var linkSpan = document.createElement("i");

    $(linkSpan).attr("class", Data_n)
    //.attr("data-n", Data_n)
    .attr("data-onparent", "true");
    if (isChildSpan) {
        $(linkSpan).attr("data-color", "black")
        var linksecondSpan = document.createElement("span");
        //linksecondSpan.createElement("span");
        $(linksecondSpan).attr("class", "text_padding").text(Name);
        $(linkSpan).appendTo(linka);
        $(linksecondSpan).appendTo(linka);
    }
    else {
        $(linkSpan).appendTo(linka);
        $(linka).append("<span>" + Name + "</span>");
        //$(linka).append(Name);

    }

    return linkLi;
}


function add3Dots(string, limit) {
    var dots = "...";
    if (string.length > limit) {
        // you can also use substr instead of substring
        string = string.substring(0, limit) + dots;
    }

    return string;
}

// Common Methods NonDisclosureOrder
function fn_Get_NonDisclosureOrder(requestObj, isExpUser=false) {
    $.ajax({
        type: "GET",
        url: "/Enforcement/Expungement_GetNonDisclosureOrder?id=" + requestObj.Id + "&workItemType=" + requestObj.WorkItemType,
        contentType: "application/json",
        data: '',
        success: function (data) {
            var popupNotification = $("#Notification").data("kendoNotification");
            if (data != null) {
                
                //if (data === true) { }
                if (requestObj.isProtest != undefined && requestObj.isProtest && requestObj.WorkItemType == "COM") {
                    fn_ShowOrHide_ProtestDll_Options(data, isExpUser);
                } else if (requestObj.WorkItemType == "COM" || requestObj.WorkItemType == "BOP") {
                    fn_ShowOrHide_ComplaintDll_Options(data, isExpUser);
                } else if (requestObj.WorkItemType == "INV") {
                    fn_ShowOrHide_InvDll_Options(data, isExpUser);
                } else if (requestObj.WorkItemType == "CAS") {
                    fn_ShowOrHide_Case_Dll_Options(data, isExpUser);
                } else if (requestObj.WorkItemType == "LEG") {
                    fn_ShowOrHide_LegalCase_Dll_Options(data, isExpUser);
                } else if (requestObj.WorkItemType == "LIC") {
                    fn_ShowOrHide_LegalCase_Dll_Options(data, isExpUser);
                }
             
            }
            else {
                popupNotification.show({ message: "Error getting  Non-Disclosure Order Details." }, "error");
            }
        },
        error: function (objError) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went wrong. Please try again." }, "error");
        }
    });
}

function fn_Update_NonDisclosureOrder(updateRequest) {
    $.ajax({
        type: "POST",
        url: "/Enforcement/Expungement_SaveNonDisclosureOrder",
        contentType: "application/json",
        data: JSON.stringify(updateRequest),
        success: function (data) {
            var popupNotification = $("#Notification").data("kendoNotification");
            if (data != null && data === true) {
                if (updateRequest.isProtest != undefined && updateRequest.isProtest && updateRequest.WorkItemType == "COM") {
                    fn_get_Protest_NonDisclosureOrder(true);
                } else if (updateRequest.WorkItemType == "COM" || updateRequest.WorkItemType == "BOP") {
                    //popupNotification.show({ message: "Complainee Non Disclosure Order is updated successfully." }, "success");
                    fn_get_Com_NonDisclosureOrder(true);
                } else if (updateRequest.WorkItemType == "INV") {
                    //popupNotification.show({ message: "Investigation Non Disclosure Order is updated successfully." }, "success");
                    fn_get_Inv_NonDisclosureOrder(true);
                } else if (updateRequest.WorkItemType == "CAS") {
                    //popupNotification.show({ message: "Investigation Non Disclosure Order is updated successfully." }, "success");
                    fn_get_Case_NonDisclosureOrder(true);
                } else if (updateRequest.WorkItemType == "LEG") {
                    fn_get_LegalCase_NonDisclosureOrder(true);
                }

                popupNotification.show({ message: "Non-Disclosure Order is updated successfully." }, "success");
            }
            else {
                popupNotification.show({ message: "Error updating Non-Disclosure Order Details." }, "error");
            }
        },
        error: function (objError) {
            var popupNotification = $("#Notification").data("kendoNotification");
            popupNotification.show({ message: "Something went wrong. Please try again." }, "error");
        }
    });
}  

// Ndo - Confirmation message popUp :

function onClick_Ndo_Cancel_Confirmation() {
    var itemType = $("#hdn_Ndo_Confirm_ItemType").val();
    var ddlActionsObj = document.getElementById("ddlComplaintActions");
    if (itemType == "PRT") {
        var ddlActionsObj = document.getElementById("ddlProtestActions");
    } else if (itemType == "INV") {
        var ddlActionsObj = document.getElementById("selectInvestigationActions");
    } else if (itemType == "CAS") {
        var ddlActionsObj = document.getElementById("selectCaseActions1");
    }
    ddlActionsObj.selectedIndex = 0; return;
}

function onClick_Ndo_Yes_Confirmation() {
    var itemType = $("#hdn_Ndo_Confirm_ItemType").val();
    if (itemType == "COM") {
        fn_Update_Complaint_NonDisclosureOrder('remove');
    } else if (itemType == "PRT") {
        fn_Update_Protest_NonDisclosureOrder('remove');
    } else if (itemType == "INV") {
        fn_Update_Inv_NonDisclosureOrder('remove');
    } else if (itemType == "CAS") {
        fn_Update_Case_NonDisclosureOrder('remove');
    }
}

function fn_Ndo_Confirmation(itemType) {
    $("#hdn_Ndo_Confirm_ItemType").val(itemType);
    ShowModalDialog1('Are you sure you want to remove NDO ?', 'onClick_Ndo_Yes_Confirmation');
    return false;
}

// #Region common functions:
function isValidEmailAddressDomain(emailAddress) {
    debugger;
    if (document.getElementById("hdnEmailAddressDomain") != undefined) {
        var emailAddExtValue = document.getElementById("hdnEmailAddressDomain").value;
        var emailSplitList = emailAddress.split("@");
        var emailAddExt = emailSplitList[emailSplitList.length - 1]
        if (emailAddExt != emailAddExtValue) { return false }
        return true;
    } else {
        return false;
    }
}   
var isNdoCancel1 = false;
function ShowModalDialog1(BodyText, callbackFn, optVal = '') {
    $("#modal-btn-no").css("display", "block");
    $("#modal-btn-yes").css("display", "block");

    $("#modal-body-text").html(BodyText);
    $("#mi-modal").modal('show');
    $('#hdnModalYesSubmitEvent').removeAttr('onclick');

    $('#hdnModalYesSubmitEvent').attr('onClick', '' + callbackFn + '();');
    isNdoCancel1 = true;
    }
function onModalBtnYesClick() {
    $("#mi-modal").modal('hide');
    $('#hdnModalYesSubmitEvent').click();
    $('#hdnModalYesSubmitEvent').removeAttr('onclick');
}
function onModalBtnCancelClick() {
    $("#mi-modal").modal('hide');
    $('#hdnModalCancelSubmitEvent').click();
    $('#hdnModalCancelSubmitEvent').removeAttr('onclick');
    if (isNdoCancel1) {
        onClick_Ndo_Cancel_Confirmation();
    }
}