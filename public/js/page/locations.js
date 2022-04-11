$('#location-modal').fireModal({
    title:"location",
    center:true,
    body:`<form id="location_form" method="post" data-form-valid="saveLocationDetails">
                    <div class="card shadow-none">
                        <div class="">
                            <div class="form-group">
                                <label>Name</label>
                                <input type="hidden" name="updateLocationId" id="updateLocationId"/>
                                <input type="text" class="form-control" name="name"
                                       id="name"
                                       data-valid="required" data-msg="Please enter name"
                                >
                            </div>
                            <div class="form-group">
                                <label class="form-label">Status</label>
                                <div class="selectgroup selectgroup-pills">
                                    <label class="selectgroup-item">
                                        <input type="radio" name="status" value="1" class="selectgroup-input" checked="">
                                        <span class="selectgroup-button selectgroup-button-icon"><i
                                                    class="fas fa-sun"></i></span>
                                    </label>
                                    Active
                                    <label class="selectgroup- pl-2">
                                        <input type="radio" name="status" value="0" class="selectgroup-input">
                                        <span class="selectgroup-button selectgroup-button-icon"><i
                                                    class="fas fa-moon"></i></span>
                                    </label>
                                    Inactive
                                </div>
                            </div>
                        </div>
                        <div class="align-items-end d-flex justify-content-end">
                            <button type="submit" class="btn btn-primary">Save Changes</button>
                        </div>
                    </div>
                </form>`
});
