module Popular
    def popular(tags, text)
        if tags.include? "popular"
            "<b>" +
            text +
            "</b>"
        else 
            text
        end
    end
end

Liquid::Template.register_filter(Popular)