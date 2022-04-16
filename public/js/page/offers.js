
$(document).ready(function () {
    $("#applyTo").on('change',function (e) {
        let selectedValue=parseInt($(this).val());
            if(selectedValue===2){
                $("#specifyProductSelectionBox").removeClass("d-none");
                $("#minSubTotalAmountBox").addClass("d-none");
                $("#specifyUserSelectionBox").addClass("d-none");
            }else if(selectedValue===3){
                $("#specifyProductSelectionBox").addClass("d-none");
                $("#minSubTotalAmountBox").removeClass("d-none");
                $("#specifyUserSelectionBox").addClass("d-none");
            }else if(selectedValue===4){
                $("#specifyProductSelectionBox").addClass("d-none");
                $("#minSubTotalAmountBox").addClass("d-none");
                $("#specifyUserSelectionBox").removeClass("d-none");
            }else{
                $("#specifyProductSelectionBox").addClass("d-none");
                $("#minSubTotalAmountBox").addClass("d-none");
                $("#specifyUserSelectionBox").addClass("d-none");
            }
    });
})
