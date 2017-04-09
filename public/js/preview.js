function preview(){

    var list = getSlideOrder();
    var indexImg = 0;
    clear();

    list.forEach(function(index) {
        var carousel = document.getElementById("carousel-preview");
        carousel.className = "carousel slide";

        var divHold = buildDiv(buildImg(presentationStorage.getSlideById(index)));
        var indicador = buildIndicator();

        appendWraper(divHold);
        appendIndicator(indicador);
        indexImg++;
    }, this);

    function clear(){
        $("#wrapper-slides").children().remove();
        $("#preview-indicators").children().remove();
    }

    function buildListIndicators(amount){
        var indicators = [];
       // <li data-target="#carousel-preview" data-slide-to="0" class="active"></li>
        for (var index = 0; index < amount; index++) {
            indicators.push(buildIndicator());
        }
        return indicators;
    }

    function buildIndicator(){
        var indicator = document.createElement("li");
        indicator.setAttribute("data-target", "#carousel-preview");
        indicator.setAttribute("data-slide-to", indexImg)
        indicator.className = indexImg === 0 ? "active" : "";


        /*
        indicator["data-target"] = "#carousel-preview";
        indicator["data-slide-to"] = indexImg;
        indicator["class"] = indexImg === 0 ? "active" : "";
        */
        return indicator;
    }
    

    function appendIndicator(indicador){
        $("#preview-indicators").append(indicador);
    }

    function appendWraper(divHold){
        $("#wrapper-slides").append(divHold);
    }

    function buildImg(slideImg){
        var img = document.createElement('img');
        img.src = slideImg.page;
        img.className = "img-preview"
        return img;

    }
    function buildDiv(img){
        var divHold = document.createElement('div');
        divHold.align = "center";
        addClassName(divHold);
        divHold.append(img);
        
        return divHold;
    }

    function addClassName(divHold){
        if(indexImg === 0){
            divHold.className = "item active";
        }else{
            divHold.className = "item"
        }
    }
}