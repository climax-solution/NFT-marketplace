const style = `
.items_filter {
    display: flex;
    align-items: center;
    #form_quick_search {
        height: 42px;
        top: 0;
        width: calc(100% - 200px);
        .form-control {
            width: calc(100% - 60px);
        }
    }
}
.dropdownSelect {
    margin-bottom: 0;
    @media only screen and (max-width: 768px) {
        width: 200px;
    }
}
@media only screen and (max-width: 600px) {
    .items_filter {
        flex-direction: column;
    }

    #form_quick_search {
        width: 100%;
        margin: 0;
        margin-bottom: 20px;
    }

    #form_quick_search .col {
        padding-left: 0;
    }

    #btn-submit {
        width: 60px;
    }
    
    .dropdownSelect {
        width: 100%;
    }
}`;

export default style;