(function(){
    'use strict';
    document.body.style.margin = 0,
    document.body.style.padding = 0,
    document.body.style.overflow = 'hidden';
    var isInLoading = true;
    var needToLoadCSSURL = [];
    let domcv = {},
        doms = [{
            dataType: '0e7a9c8f',
            tagName: 'html',
            attrs: {},
            children: ['0a8e9d2f','0gh7i8j2']
        },{
            dataType: '0a8e9d2f',
            tagName: 'head',
            attrs: {},
            children: []
        },{
            dataType: '0gh7i8j2',
            tagName: 'body',
            attrs: {},
            children: []
        }];
        domcv.end_reached = function() {}
        function cssSelector(selector, scope = null) {
            const elements = [];
            const scopeData = scope ? scope : doms.map(item => item.dataType);
            
            // Split selector into parts (tag, id, class, attributes)
            const parts = selector.match(/(?:[^.#[\]]|\[.*?\])+/g) || [];
            
            for (const dom of doms) {
                if (!scopeData.includes(dom.dataType)) continue;
                
                let matches = true;
                
                // Check tag name if specified
                const tagPart = parts.find(p => !p.startsWith('#') && !p.startsWith('.') && !p.startsWith('['));
                if (tagPart && dom.tagName.toLowerCase() !== tagPart.toLowerCase()) {
                    matches = false;
                }
                
                // Check ID if specified
                const idPart = selector.match(/#([^.#[\]]+)/);
                if (idPart && dom.attrs.id !== idPart[1]) {
                    matches = false;
                }
                
                // Check classes if specified
                const classParts = selector.match(/\.[^.#[\]]+/g) || [];
                for (const classPart of classParts) {
                    const className = classPart.substring(1);
                    if (!dom.attrs.class || !dom.attrs.class.split(' ').includes(className)) {
                        matches = false;
                        break;
                    }
                }
                
                // Check attributes if specified
                const attrParts = selector.match(/\[[^\]]+\]/g) || [];
                for (const attrPart of attrParts) {
                    const attrStr = attrPart.slice(1, -1);
                    const [attrName, attrValue] = attrStr.split('=');
                    
                    if (!dom.attrs[attrName]) {
                        matches = false;
                        break;
                    }
                    
                    if (attrValue) {
                        const value = attrValue.replace(/^['"]|['"]$/g, '');
                        if (dom.attrs[attrName] !== value) {
                            matches = false;
                            break;
                        }
                    }
                }
                
                if (matches) {
                    elements.push(dom);
                }
            }
            
            return elements;
        }
    
        // Improved loadCSS function
        domcv.loadCSS = function(url, noCrossing = true) {
            if (!needToLoadCSSURL.includes(url)) needToLoadCSSURL.push(url);
            return fetch((!noCrossing ? 'https://api.codetabs.com/v1/proxy/?quest=' : '') + url)
                .then(response => {
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    return response.text();
                })
                .then(cssText => {
                    // Parse CSS rules
                    const rules = [];
                    const styleEl = document.createElement('style');
                    styleEl.textContent = cssText;
                    document.head.appendChild(styleEl);
                    
                    try {
                        const sheet = styleEl.sheet;
                        for (let i = 0; i < sheet.cssRules.length; i++) {
                            const rule = sheet.cssRules[i];
                            rules.push({
                                selector: rule.selectorText,
                                styles: rule.style.cssText
                            });
                        }
                    } catch (e) {
                        console.warn('Could not parse CSS rules due to CORS restrictions');
                    }
                    
                    document.head.removeChild(styleEl);
                    
                    // Apply styles to DOM elements
                    for (const rule of rules) {
                        try {
                            const elements = cssSelector(rule.selector);
                            for (const element of elements) {
                                if (!element.attrs.style) {
                                    element.attrs.style = {};
                                }
                                
                                // Parse and apply styles
                                const styles = rule.styles.split(';')
                                    .filter(s => s.trim())
                                    .map(s => {
                                        const [prop, value] = s.split(':').map(p => p.trim());
                                        return { prop, value };
                                    });
                                
                                for (const style of styles) {
                                    if (style.prop && style.value) {
                                        element.attrs.style[style.prop] = style.value;
                                    }
                                }
                            }
                        } catch (e) {
                            console.warn(`Could not apply CSS rule: ${rule.selector}`);
                        }
                    }
                    for (var i = 0;i < doms.length;i++) {
                        if (!doms[i].style || doms[i].style === undefined) {
                            doms[i].style = doms[i].attrs.style ?? {}
                        }
                    }
                    return rules;
                })
                .catch(error => {
                    console.error('Error loading CSS:', error);
                    throw error;
                });
        };
    function getParentElement(element) {
        for (var i = 0;i < doms.length;i++) {
            if (doms[i].children.indexOf(element.dataType) > -1) {
                return doms[i];
            }
        }
    }
    function wrapTextNodesAndReturnHTML(element) {
        const clonedElement = element.cloneNode(true);
        
        const processNode = (node) => {
          const childNodes = Array.from(node.childNodes);
          
          childNodes.forEach(child => {
            if (child.nodeType === Node.TEXT_NODE && child.textContent.trim() !== '') {
              const wrapper = document.createElement('unusedDomCanvas-text');
              child.replaceWith(wrapper);
              wrapper.appendChild(child);
            } else if (child.nodeType === Node.ELEMENT_NODE) {
              processNode(child);
            }
          });
        };
        
        processNode(clonedElement);
        return document.createRange().createContextualFragment(clonedElement.outerHTML);
      }
      function freshAllCSS() {
          for (var i = 0; i < needToLoadCSSURL.length; i++) {domcv.loadCSS(needToLoadCSSURL[i], true, true);}
      }
      domcv.render = ($el) => {
        freshAllCSS();
        isInLoading = true;
        var savedRandomKeys = [],
            isInChildren = false;
        var elToElement = document.createRange().createContextualFragment($el);
        var nodes = null;
        var processNodes = (nodeList, parentKey = null) => {
            for (let node of nodeList) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    let randomKey = Math.random().toString(36).substr(2, 9);
                    if (parentKey) {
                        let parent = doms.find(item => item.dataType === parentKey);
                        if (parent) parent.children.push(randomKey);
                    }
                    
                    savedRandomKeys.push(randomKey);
                    
                    var obj = {
                        dataType: randomKey,
                        tagName: node.tagName.toLowerCase(),
                        attrs: [],
                        children: [],
                        rawEl: node
                    };
                    
                    if (node.attributes) {
                        for (var j = 0; j < node.attributes.length; j++) {
                            var attr = node.attributes[j];
                            obj.attrs.push({
                                name: attr.name,
                                value: attr.value
                            });
                        }
                    }
                    
                    if (node.style) {
                        let smallOBJ = {}
                        for (var kp = 0;kp < node.style.length; kp++)
                        {
                            smallOBJ[node.style[kp]] = node.style[node.style[kp]]
                        }
                    }
                    if (node.className) obj.attrs.push({name: 'class', value: node.className});
                    if (node.id) obj.attrs.push({name: 'id', value: node.id});
                    
                    doms.push(obj);
                    
                    if (node.childNodes.length > 0) {
                        processNodes(node.childNodes, randomKey);
                    }
                }
                else if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '') {
                    let randomKey = Math.random().toString(36).substr(2, 9);
                    if (parentKey) {
                        let parent = doms.find(item => item.dataType === parentKey);
                        if (parent) parent.children.push(randomKey);
                    }
                    
                    var textObj = {
                        dataType: randomKey,
                        tagName: '::text',
                        attrs: [],
                        children: [],
                        content: node.textContent.trim()
                    };
                    
                    doms.push(textObj);
                }
            }
            // console.log(doms)
        };
        processNodes(elToElement.childNodes,doms[2].dataType);
        isInLoading = false;
    };
    var CanvasNode = document.createElement('canvas');
    CanvasNode.id = 'domcv', CanvasNode.width = window.innerWidth, CanvasNode.height = window.innerHeight;
    document.body.appendChild(CanvasNode);
    CanvasNode = document.getElementById('domcv');
    var Fresh = true;
    var isDragY = false;
    var isInHover = false;
    setInterval(function(){
        addEventListener('resize',function(){
            CanvasNode.width = window.innerWidth, CanvasNode.height = window.innerHeight
            if (maxHeight > innerHeight) {
                domcv.isScrollYDo = true;
            } else {
                domcv.isScrollYDo = false;
                domcv.scrollYHeight = 0;
            }
        });
        var t = CanvasNode.getContext('2d');
        if (Fresh) {
            t.clearRect(0, 0, window.innerWidth, window.innerHeight);
            Fresh = false;
        }
        if (isInLoading) {
            t.fillStyle = '#081027'
            t.fillRect(0, 0, window.innerWidth, window.innerHeight);
            var img = new Image();
            img.src = '../loading.png'
            img.onload = function(){
                t.drawImage(img, 0, window.innerHeight * 0.375 - img.height, Math.min(window.innerWidth, window.innerHeight),Math.min(window.innerWidth, window.innerHeight) / 3.4358974358974357);
            }
        }
        let vh_1 = window.innerHeight * 0.01;
        let vw_1 = window.innerWidth * 0.01;
        let vmin_1 = Math.min(vh_1, vw_1);
        let vmax_1 = Math.max(vh_1, vw_1);
        let rem_1 = 16;
        let em_1 = 12;
        let cm_1 = 37.8;
        let mm_1 = 3.78;
        let in_1 = 96;
        let pt_1 = 4 / 3;
        let pc_1 = 15.4;
        let px_1 = 1;
        if (typeof domcv.scrollXHeight === 'undefined' && typeof domcv.scrollYHeight === 'undefined') {
            domcv.scrollXHeight = 0;
            domcv.scrollYHeight = 0;
            domcv.isScrollXDo = false;
            domcv.isScrollYDo = false;
        }
        t.font = '1rem 微软雅黑';
        function noNaN(value) {
            return typeof value !== 'bigint' ? 0n : value;
        }
        function ConvertOriginal(value){
            function p() {
                value = value.replace('px','')
                .replace('rem','')
                .replace('em','')
                .replace('cm','')
                .replace('mm','')
                .replace('in','')
                .replace('pt','')
                .replace('pc','')
                .replace('vmin','')
                .replace('vmax','')
                .replace('vh','')
                .replace('vw','')
                .replace('rem','')
            }
            if (value.endsWith('px')) {
                p()
                return BigInt(Math.floor(Number(value)) * px_1 * 64)
            }
            if (value.endsWith('rem')) {
                p()
                return BigInt(Math.floor(Number(value)) * rem_1 * 64)
            }
            if (value.endsWith('em')) {
                p()
                return BigInt(Math.floor(Number(value)) * em_1 * 64)
            }
            if (value.endsWith('cm')) {
                p()
                return BigInt(Math.floor(Number(value)) * cm_1 * 64)
            }
            if (value.endsWith('mm')) {
                p()
                return BigInt(Math.floor(Number(value)) * mm_1 * 64)
            }
            if (value.endsWith('in')) {
                p()
                return BigInt(Math.floor(Number(value)) * in_1 * 64)
            }
            if (value.endsWith('pt')) {
                p()
                return BigInt(Math.floor(Number(value)) * pt_1 * 64)
            }
            if (value.endsWith('pc')) {
                p()
                return BigInt(Math.floor(Number(value)) * pc_1 * 64)
            }
            if (value.endsWith('ch')) {
                p()
                return BigInt(Math.floor(Number(value)) * ch_1 * 64)
            }
            if (value.endsWith('vw')) {
                p()
                return BigInt(Math.floor(Number(value) * vw_1 * 64))
            }
            if (value.endsWith('vh')) {
                p()
                return BigInt(Math.floor(Number(value) * vh_1 * 64))
            }
            if (value.endsWith('vmin')) {
                p()
                return BigInt(Math.floor(Number(value)) * vmin_1 * 64)
            }
            if (value.endsWith('vmax')) {
                p()
                return BigInt(Math.floor(Number(value)) * vmax_1 * 64)
            }
            
        }
        function gotType(datatype) {
            for (var i = 0; i < doms.length;i++) {
                if (doms[i].dataType === datatype) {
                    return doms[i];
                }
            }
            return null;
        }

        function getAllChildren(dom_target) {
            let tarChildren = dom_target.children;
            for (var i = 0; i < tarChildren.length; i++) {
                // if (gotType(tarChildren[i].children.dataType).length > 0) {
                //     tarChildren = tarChildren.concat(getAllChildren(tarChildren[i]))
                // }
                for (var j = 0;j < gotType(tarChildren[i]).children.length;j++) {
                    //if (gotType(tarChildren[i].children[j]).length > 0) {
                        tarChildren = tarChildren.concat(gotType(tarChildren[i]).children[j])
                    //}
                }
            }
            return tarChildren;
        }

        function getStrLength(str) {
            let len = 0;
            for (let i = 0; i < str.length; i++) {
                if (str[i] === ',' || str[i] === '.' || str[i] === '?' || str[i] === '!' || str[i] === ';' || str[i] === ':') {
                    len += 1/4;
                }
                else if (str[i].toLowerCase() === str[i]) {
                    len += 0.5;
                } 
                else if (str[i].toUpperCase() === str[i]) {
                    len += 2/3
                }
                else if (str[i].match(/[\u4e00-\u9fa5]/)) {
                    len += 1;
                }
                else if (str[i].match(/[\u3002\uff1b\uff0c\uff1a\u2019\u201d\uff08\uff09\u3014\u3015\u3010\u3011\u3001\uff0e\u300a\u300b\u3008\u3009]/)) {
                    len += 1;
                }
                else {
                    len += 2/3
                }
            }
            return len;
        }

        let maxHeight = Number(ConvertOriginal('100vh')) / 64;
        let maxWidth = Number(ConvertOriginal('100vw')) / 64;

        doms.forEach((dom)=> {
            function getPosition(dom_target){
                // 1. Get the position
                let pos = [0n,0n]
                if (dom_target.attrs.style?.position === 'absolute' || dom_target.attrs.style?.position === 'sticky' || dom_target.attrs.style?.position === 'fixed') {
                    let p = 'left', q = 'top'
                    if (!dom_target.attrs.style.left) {
                        p = 'right';
                    }
                    if (!dom_target.attrs.style.top) {
                        q = 'bottom';
                    }
                    try {
                        // if (p === 'left' && q === 'top') pos = (2n**BigInt(noNaN(ConvertOriginal(dom_target.attrs.style[p])))) * (5n**BigInt(64n * noNaN(ConvertOriginal(dom_target.attrs.style[q]))))
                        // if (p === 'left' && q === 'bottom')pos = (2n**BigInt(noNaN(ConvertOriginal(dom_target.attrs.style[p])))) * (5n**BigInt( noNaN(ConvertOriginal(innerHeight - dom_target.attrs.style[q]))))
                        // if (p === 'right' && q === 'top') pos = (2n**BigInt(noNaN(ConvertOriginal(innerWidth - dom_target.attrs.style[p])))) * (5n**BigInt(ConvertOriginal(noNaN(dom_target.attrs.style[q]))))
                        // if (p === 'right' && q === 'bottom') pos = (2n**BigInt(noNaN(ConvertOriginal(innerWidth - dom_target.attrs.style[p])))) * (5n**BigInt(ConvertOriginal(noNaN(innerHeight - dom_target.attrs.style[q])))) * 4096n * 5n * 5n

                        if (p === 'left' && q === 'top') pos = [BigInt(noNaN(ConvertOriginal(dom_target.attrs.style[p]))), BigInt(noNaN(ConvertOriginal(dom_target.attrs.style[q])))];
                        if (p === 'left' && q === 'bottom') pos = [BigInt(noNaN(ConvertOriginal(dom_target.attrs.style[p]))), BigInt(noNaN(innerHeight - dom_target.attrs.style[q]))];
                        if (p === 'right' && q === 'top') pos = [BigInt(noNaN(innerWidth - dom_target.attrs.style[p])), BigInt(noNaN(ConvertOriginal(dom_target.attrs.style[q])))];
                        if (p === 'right' && q === 'bottom') pos = [BigInt(noNaN(innerWidth - dom_target.attrs.style[p])), BigInt(noNaN(innerHeight - dom_target.attrs.style[q]))];
                    }
                    catch {
                        pos = 0n;
                    }
                    if (dom_target.attrs.style?.position === 'absolute') {
                        pos[0] -= BigInt(scrollXHeight);
                        pos[1] -= BigInt(scrollYHeight);
                    }
                    if (dom_target.attrs.style?.position === 'sticky') {
                        pos[0] -= BigInt(scrollXHeight);
                        pos[1] -= BigInt(scrollYHeight)
                        pos[0] = Math.max(0n, pos[0]);
                        pos[1] = Math.max(0n, pos[1]);
                    }
                }
                if (dom_target.attrs.style?.position === 'relative') {
                    // get the parent
                    let parent = getParentElement(dom_target);
                    if (parent) {
                        pos = getPosition(parent)
                    }
                    pos[0] += BigInt(dom_target.attrs.style?.left || 0);
                    pos[1] += BigInt(dom_target.attrs.style?.top || 0);
                    
                    pos[0] -= BigInt(scrollXHeight);
                    pos[1] -= BigInt(scrollYHeight)
                }
                if (!dom_target.attrs.style?.position || dom_target.attrs.style?.position === 'static') {
                    // get the parent
                    let parent = getParentElement(dom_target);
                    if (parent)
                        pos = getPosition(parent)
                    // get the parent-children before it
                    let siblings = parent?.children;
                    let nsiblings = [];
                    if (siblings === undefined) siblings = [];
                    for (var j = 0;j < siblings.length;j++) {
                        nsiblings.push(gotType(siblings[j]));
                    }
                    
                    let n_siblings = [];
                    
                    for (var j = 0;j < nsiblings.length;j++) {
                        if (nsiblings[j] === dom_target &&
                            getParentElement(nsiblings[j]) === parent
                        ) {
                            break;
                        }
                        if (!nsiblings.attrs?.style?.position || nsiblings.attrs?.style?.position === 'static') n_siblings.push(nsiblings[j]);
                    }

                    let posXOffset = 0n;
                    let posYOffset = 0n;

                    for (var q = 0;q < n_siblings.length;q++) {
                        posXOffset += n_siblings[q].width ?? 0n;
                        posYOffset += n_siblings[q].height ?? 0n;
                        if (n_siblings[q].tagName === "::text") {
                            if (+(n_siblings[q].attrs?.style?.['font-weight'].replace(' | inherits','') ?? 400) > 500) {
                                pos[0] += (BigInt(n_siblings[q].attrs?.style?.['font-size'] ?? 16n)) * BigInt(Math.round(getStrLength(n_siblings[q].content))) + (BigInt(dom.attrs?.style?.['font-size'] ?? 16n)) * BigInt(Math.round(getStrLength(n_siblings[q].content))) / 6n
                            }
                            else {
                                pos[0] += (BigInt(n_siblings[q].attrs?.style?.['font-size'] ?? 16n)) * BigInt(Math.round(getStrLength(n_siblings[q].content)))
                            }
                        }
                        
                        if (n_siblings[q].attrs?.style?.['display'] === 'block') {
                            pos[0] = 0n;
                            pos[1] += ConvertOriginal(n_siblings[q].attrs?.style?.height ?? 0n);
                            pos[1] += ConvertOriginal(n_siblings[q].attrs?.style?.['margin-bottom'] ?? 0n);
                        }
                        var mT = dom_target.attrs?.style?.['margin-top'] ?? '0px',mT = Number(ConvertOriginal(mT))
                        pos[1] += BigInt(mT);
                    }
                    // pos[0] += posXOffset;
                    // pos[1] += posYOffset;
                    // pos[0] = pos[0] - BigInt(window.domcv.scrollXHeight);
                    // pos[1] = pos[1] - BigInt(window.domcv.scrollYHeight);)
                }
                let o;
                if (dom.attrs?.style?.height === undefined) {
                    o = Number(ConvertOriginal(dom.attrs?.style?.height ?? '0vh')) / 64;
                }
                else {
                    o = Number(ConvertOriginal(dom.attrs?.style?.height)) / 64;
                }
                maxHeight = Math.max(maxHeight, Number(pos[1]) / 64 + o);
                return pos;
            }
            if (maxHeight > Number(ConvertOriginal('100vh')) / 64) {
                domcv.isScrollYDo = true;
            }
            if (dom.attrs?.style?.color !== undefined) {
               // console.log(dom,getAllChildren(dom))
                for (var j = 0;j < getAllChildren(dom).length;j++) {
                    let el_children = gotType(getAllChildren(dom)[j]);
                    //console.log(el_children,dom)
                    if (
                        el_children.attrs?.style?.color === undefined || (
                         el_children.attrs?.style?.color.endsWith('| inherits') &&
                         el_children.attrs?.style?.color !== dom.attrs?.style?.color
                        )
                    ) {
                        //console.log(el_children)
                        if (!doms[doms.indexOf(el_children)].attrs.style) {
                            doms[doms.indexOf(el_children)].attrs.style = {}
                        }
                        doms[doms.indexOf(el_children)].attrs.style.color = dom.attrs?.style?.color + ' | inherits';
                    }
                }
            }

            if (dom.attrs?.style?.['font-weight'] !== undefined) {
                // console.log(dom,getAllChildren(dom))
                 for (var j = 0;j < getAllChildren(dom).length;j++) {
                     let el_children = gotType(getAllChildren(dom)[j]);
                     //console.log(el_children,dom)
                     if (
                         el_children.attrs?.style?.['font-weight'] === undefined || (
                          el_children.attrs?.style?.['font-weight'].endsWith('| inherits') &&
                          el_children.attrs?.style?.['font-weight'] !== dom.attrs?.style?.['font-weight']
                         )
                     ) {
                         //console.log(el_children)
                         if (!doms[doms.indexOf(el_children)].attrs.style) {
                             doms[doms.indexOf(el_children)].attrs.style = {}
                         }
                         doms[doms.indexOf(el_children)].attrs.style['font-weight'] = dom.attrs?.style?.['font-weight'] + ' | inherits';
                     }
                 }
             }

             if (dom.attrs?.style?.['font-style'] !== undefined) {
                // console.log(dom,getAllChildren(dom))
                 for (var j = 0;j < getAllChildren(dom).length;j++) {
                     let el_children = gotType(getAllChildren(dom)[j]);
                     //console.log(el_children,dom)
                     if (
                         el_children.attrs?.style?.['font-style'] === undefined || (
                          el_children.attrs?.style?.['font-style'].endsWith('| inherits') &&
                          el_children.attrs?.style?.['font-style'] !== dom.attrs?.style?.['font-style']
                         )
                     ) {
                         //console.log(el_children)
                         if (!doms[doms.indexOf(el_children)].attrs.style) {
                             doms[doms.indexOf(el_children)].attrs.style = {}
                         }
                         doms[doms.indexOf(el_children)].attrs.style['font-style'] = dom.attrs?.style?.['font-style'] + ' | inherits';
                     }
                 }
             }

             if (dom.attrs?.style?.['background'] !== undefined) {
                // background to background=xxx
                // split to the background-color, background-image, background-repeat, background-position, background-size
                // https://developer.mozilla.org/zh-CN/docs/Web/CSS/background
                // https://developer.mozilla.org/zh-CN/docs/Web/CSS/background-color
                // https://developer.mozilla.org/zh-CN/docs/Web/CSS/background-image
                // https://developer.mozilla.org/zh-CN/docs/Web/CSS/background-repeat
                // https://developer.mozilla.org/zh-CN/docs/Web/CSS/background-position
                // https://developer.mozilla.org/zh-CN/docs/Web/CSS/background-size
                // https://developer.mozilla.org/zh-CN/docs/Web/CSS/background-origin
                // https://developer.mozilla.org/zh-CN/docs/Web/CSS/background-clip
                // https://developer.mozilla.org/zh-CN/docs/Web/CSS/background-attachment
                // https://developer.mozilla.org/zh-CN/docs/Web/CSS/background-blend-mode
                
                // https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Backgrounds_and_Borders/Using_multiple_backgrounds
                // https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Backgrounds_and_Borders/Resizing_background_images
                // https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Backgrounds_and_Borders/Background_complications
                // https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Backgrounds_and_Borders/Using_CSS_gradients
                // https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Backgrounds_and_Borders/Using_background_regions
                // https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Backgrounds_and_Borders/Advanced_backgrounds

                // FOR EXAMPLE:
                // * background: green;
                // * background: content-box radial-gradient(crimson, skyblue);
                // * background: no-repeat url("/shared-assets/images/examples/lizard.png");
                // * background: left 5% / 15% 60% repeat-x 
                // url("/shared-assets/images/examples/star.png");
                // background:
                // center / contain no-repeat
                // url("/shared-assets/images/examples/firefox-logo.svg"),
                // #eee 35% url("/shared-assets/images/examples/lizard.png");

                function parseBackground(background) {
                    const result = {
                      'background-color': 'transparent',
                      'background-image': 'none',
                      'background-position': '0% 0%',
                      'background-size': 'auto',
                      'background-repeat': 'repeat',
                      'background-origin': 'padding-box',
                      'background-clip': 'border-box',
                      'background-attachment': 'scroll'
                    };
                  
                    if (!background || background.trim() === 'none') {
                      return result;
                    }
                  
                    let remaining = background.trim();
                    
                    const imageRegex = /(url\([^)]*\)|(repeating-)?(linear|radial|conic)-gradient\([^)]*\))/i;
                    const imageMatch = remaining.match(imageRegex);
                    if (imageMatch) {
                      result['background-image'] = imageMatch[0];
                      remaining = remaining.replace(imageMatch[0], '').trim();
                    }
                  
                    const colorRegex = /(#[0-9a-f]{3,8}|(rgb|hsl)a?\([^)]*\)|[a-z]+)/i;
                    const colorMatch = remaining.match(colorRegex);
                    if (colorMatch) {
                      const colorValue = colorMatch[0];
                      if (/^(transparent|inherit|initial|unset|currentColor|#[0-9a-f]{3,8}|(rgb|hsl)a?\([^)]*\)|(aqua|black|blue|fuchsia|gray|green|lime|maroon|navy|olive|purple|red|silver|teal|white|yellow))$/i.test(colorValue)) {
                        result['background-color'] = colorValue;
                        remaining = remaining.replace(colorValue, '').trim();
                      }
                    }
                  
                    const parts = remaining.split(/\s+/);
                    let inPosition = false;
                    let inSize = false;
                    let positionParts = [];
                    let sizeParts = [];
                  
                    for (let i = 0; i < parts.length; i++) {
                      const part = parts[i];
                      if (!part) continue;
                  
                      if (part === 'fixed' || part === 'local' || part === 'scroll') {
                        result['background-attachment'] = part;
                        continue;
                      }
                  
                      if (part === 'repeat' || part === 'no-repeat' || part === 'repeat-x' || 
                          part === 'repeat-y' || part === 'space' || part === 'round') {
                        result['background-repeat'] = part;
                        continue;
                      }
                  
                      if (part === 'border-box' || part === 'padding-box' || part === 'content-box') {
                        if (result['background-origin'] === 'padding-box') {
                          result['background-origin'] = part;
                        } else {
                          result['background-clip'] = part;
                        }
                        continue;
                      }
                  
                      if (part === '/') {
                        inPosition = false;
                        inSize = true;
                        continue;
                      }
                  
                      if (!inPosition && !inSize && (/%|px|em|rem|vw|vh|vmin|vmax|left|right|top|bottom|center/.test(part))) {
                        inPosition = true;
                      }
                  
                      if (inPosition) {
                        positionParts.push(part);
                      } else if (inSize) {
                        sizeParts.push(part);
                      }
                    }
                  
                    if (positionParts.length > 0) {
                      result['background-position'] = positionParts.join(' ');
                    }
                  
                    if (sizeParts.length > 0) {
                      result['background-size'] = sizeParts.join(' ');
                    }
                  
                    return result;
                  }

                  function parseMargin(margin) {
                    const result = {
                      'margin-top': '0px',
                      'margin-right': '0px',
                      'margin-bottom': '0px',
                      'margin-left': '0px'
                    };
                    if (!margin || margin.trim() === 'none') {
                        return result;
                    }
                    const parts = margin.split(' ');
                    if (parts.length === 1) {
                      result['margin-top'] = parts[0];
                      result['margin-right'] = parts[0];
                      result['margin-bottom'] = parts[0];
                      result['margin-left'] = parts[0];
                    } else if (parts.length === 2)
                    {
                      result['margin-top'] = parts[0];
                      result['margin-right'] = parts[1];
                      result['margin-bottom'] = parts[0];
                      result['margin-left'] = parts[1];
                    }
                    else if (parts.length === 3) {
                      result['margin-top'] = parts[0];
                      result['margin-right'] = parts[1];
                      result['margin-bottom'] = parts[2];
                      result['margin-left'] = parts[1];
                    }
                    else if (parts.length === 4) {
                      result['margin-top'] = parts[0];
                      result['margin-right'] = parts[1];
                      result['margin-bottom'] = parts[2];
                      result['margin-left'] = parts[3];
                    }
                    else {
                        throw new Error('Invalid margin value');
                    }
                    return result;
                  }
                  let p = parseBackground(dom.attrs?.style?.background);
                  dom.attrs.style['background-color'] = p['background-color'];
                  dom.attrs.style['background-image'] = p['background-image'];
                  dom.attrs.style['background-position'] = p['background-position'];
                  dom.attrs.style['background-size'] = p['background-size'];
                  dom.attrs.style['background-repeat'] = p['background-repeat'];
                  dom.attrs.style['background-origin'] = p['background-origin'];
                  dom.attrs.style['background-clip'] = p['background-clip'];
                  dom.attrs.style['background-attachment'] = p['background-attachment'];
                  let Margin = parseMargin(dom.attrs?.style?.margin);
                  dom.attrs.style['margin-top'] = Margin['margin-top'];
                  dom.attrs.style['margin-right'] = Margin['margin-right'];
                  dom.attrs.style['margin-bottom'] = Margin['margin-bottom'];
                  dom.attrs.style['margin-left'] = Margin['margin-left'];
             }
             if (ConvertOriginal(dom.attrs?.style?.width ?? '0px') / 64n > BigInt(innerWidth)) {
                domcv.isScrollXDo = true;
             }
             if (ConvertOriginal(dom.attrs?.style?.height ?? '0px') / 64n > BigInt(innerHeight)) {
                domcv.isScrollYDo = true;
             }
            // draw the text
            if (dom.content) {
                let pos = getPosition(dom);
                t.fillStyle = dom.attrs?.style?.color.replace('| inherits', '') ?? "black";
                var fontWeight = dom.attrs?.style?.['font-weight'] ?? "normal";
                var FONTSIZE = dom.attrs?.style?.fontSize;
                if (FONTSIZE === undefined) {
                    FONTSIZE = '1rem'
                }
                else {
                    FONTSIZE += 'px'
                }
                var FONTSTYLE = dom.attrs?.style?.['font-style']
                if (FONTSTYLE === undefined) {
                    FONTSTYLE = "normal"
                }
                t.font = FONTSTYLE.replace('| inherits','') +  ' normal ' + fontWeight.replace('| inherits', '') + ' ' + FONTSIZE.replace('| inherits', '') + ' ' + ((dom.attrs?.style?.fontFamily) ?? "微软雅黑");
                var isInVisible = (Number(pos[0]) / 64 >= -maxWidth && Number(pos[0]) / 64 < innerWidth + maxWidth) && (Number(pos[1]) / 64 >= -maxHeight && Number(pos[1]) / 64 < innerHeight + maxHeight);
                if (isInVisible) {
                    t.fillText(dom.content, ((dom.attrs?.style?.fontSize) ?? 24) + Number(pos[0]) + (!window.domcv.isScrollXDo ? 0 : window.domcv.scrollXHeight), (dom.attrs?.style?.fontSize ?? 24) + Number(pos[1]) / 64 + (!window.domcv.isScrollYDo ? 0 : window.domcv.scrollYHeight))
                }
                Fresh = true;
                t.fillStyle = "black"
            }

            // the other
            else {
                var f = dom.attrs?.style?.['background-color'];
                var mL = dom.attrs?.style?.['margin-left'] ?? '0px',mL = Number(ConvertOriginal(mL))
                var mT = dom.attrs?.style?.['margin-top'] ?? '0px',mT = Number(ConvertOriginal(mT))
                var mR = dom.attrs?.style?.['margin-right'] ?? '0px',mR = Number(ConvertOriginal(mR))
                var mB = dom.attrs?.style?.['margin-bottom'] ?? '0px',mB = Number(ConvertOriginal(mB))
                if (f === undefined) f = 'transparent'
                if (dom.tagName === 'body' || dom.tagName === 'html') {
                    t.fillStyle = f;
                    var WIH = window.innerHeight;
                    
                    t.fillRect(mL/64, mB/64, window.innerWidth, WIH)
                }
                if (f !== undefined && Number(getPosition(dom)[0]) / 64 <= window.innerWidth + maxWidth && Number(getPosition(dom)[1]) / 64 <= window.innerHeight + maxHeight &&
                    Number(getPosition(dom)[0]) / 64 >= -maxWidth && Number(getPosition(dom)[1]) / 64 >= -maxHeight) {
                    t.fillStyle = f;
                    // console.log(Number(ConvertOriginal(dom.attrs?.style?.width ?? '100px')) / 64 - mR/64 - mL / 64,innerWidth)
                    t.fillRect(mL/64 + Number(getPosition(dom)[0]) / 64 + window.domcv.scrollXHeight, Number(getPosition(dom)[1]) / 64 + window.domcv.scrollYHeight+mT/64, Number(ConvertOriginal(dom.attrs?.style?.width ?? '100px')) / 64 - mL / 64, Number(ConvertOriginal(dom.attrs?.style?.height ?? '100px'))/  64);
                }
            }
        })
        domcv.maxHeight = maxHeight;
        domcv.maxWidth = maxWidth;
        // finally, draw the scrollbar
        // get os
        function getOS() {
            const platform = navigator.platform.toLowerCase();
            const userAgent = navigator.userAgent.toLowerCase();
            
            if (platform.includes("win")) return "Windows";
            if (platform.includes("mac")) return "MacOS";
            if (platform.includes("linux")) return "Linux";
            if (userAgent.includes("android")) return "Android";
            if (/iphone|ipad|ipod/.test(userAgent)) return "iOS";
            
            return false;
        }
        if (getOS() === false) {
            // draw x-scrollbar
            if (domcv.isScrollXDo) {
                t.fillStyle = "gray"
                t.fillRect(0, window.innerHeight - 15, window.innerWidth, window.innerHeight)
                t.fillStyle = "white"
                t.fillRect(12, window.innerHeight - 12, window.innerWidth - 7, window.innerHeight - 7)
                t.fillStyle = "black"
            }
            // draw the y-scroll bar
            if (domcv.isScrollYDo) {
                t.fillStyle = "gray"
                t.fillRect(window.innerWidth - 0, 0, window.innerWidth - 15, window.innerHeight)
                t.fillRect(window.innerWidth - 15, 12, window.innerWidth - 15, window.innerHeight - 7)
                t.fillStyle = "white"
                t.fillRect(window.innerWidth - 12, 12, 7, window.innerHeight - 7)
                t.fillRect(window.innerWidth - 10, 12, window.innerWidth - 15, 7)
                t.fillStyle = "black"
            }
        }
        if (getOS() === 'Windows' && (domcv.isScrollYDo || domcv.isScrollXDo)) {
            // draw y-scrollbar
            if (domcv.isScrollYDo) {
                domcv.event_p1 = window.addEventListener('mousemove', function (e) {
                    if (maxHeight <= innerHeight) return;
                    if (isDragY) {
                        domcv.scrollYHeight = -(e.clientY - 25) / (window.innerHeight - 50) * maxHeight
                        domcv.scrollYHeight = Math.max(-domcv.scrollYHeight,0)
                        domcv.scrollYHeight = -Math.min(domcv.scrollYHeight, maxHeight - window.innerHeight)
                    }
                    // is in the y-scrollbar
                    if (e.clientX > window.innerWidth - 12 && 
                        e.clientY > 25 - domcv.scrollYHeight / maxHeight * (window.innerHeight - 50) &&
                        e.clientY < 25 - domcv.scrollYHeight / maxHeight * (window.innerHeight - 50) + (innerHeight - 50) * innerHeight / maxHeight
                    ) {         
                        isInHover = true;
                    }  else isInHover = false;
                })
                domcv.event_p = window.addEventListener('mousedown', function (e) {
                    if (maxHeight <= innerHeight) return;
                    if (e.clientX > window.innerWidth - 12 && 
                        e.clientY > 25 - domcv.scrollYHeight / maxHeight * (window.innerHeight - 50) &&
                        e.clientY < 25 - domcv.scrollYHeight / maxHeight * (window.innerHeight - 50) + (innerHeight - 50) * innerHeight / maxHeight
                    ) {     isDragY = true;}else if (e.clientX > window.innerWidth - 12) {
                        isInHover = false;
                        domcv.scrollYHeight = -(e.clientY - 25) / (window.innerHeight - 50) * maxHeight
                        domcv.scrollYHeight = Math.max(-domcv.scrollYHeight,0)
                        domcv.scrollYHeight = -Math.min(domcv.scrollYHeight, maxHeight - window.innerHeight)
                    }
                });
                domcv.event_p2 = window.addEventListener('mouseup', function (e) {
                    if (maxHeight <= innerHeight) return;
                    isDragY = false;
                });
                t.fillStyle = '#ddd';
                t.fillRect(window.innerWidth - 15, 0, 15, window.innerHeight);
                t.fillStyle = '#888'
                t.beginPath();
                t.moveTo(window.innerWidth - 8, 15);
                t.lineTo(window.innerWidth - 12, 20);
                t.lineTo(window.innerWidth - 4, 20);
                t.fill();
                t.beginPath();
                t.moveTo(window.innerWidth - 8, window.innerHeight - 15);
                t.lineTo(window.innerWidth - 12, window.innerHeight - 20);
                t.lineTo(window.innerWidth - 4, window.innerHeight - 20);
                t.fill();
                if (!isInHover) {
                    t.fillStyle = '#ddd'
                    t.fillRect(window.innerWidth - 12, 25, 7, window.innerHeight - 50);
                    t.fillStyle = '#888'
                    t.fillRect(window.innerWidth - 12, 25 - domcv.scrollYHeight / maxHeight * (window.innerHeight - 50), 7, (innerHeight - 50) * innerHeight / maxHeight);
                } else {
                    t.fillStyle = '#ddd'
                    t.fillRect(window.innerWidth - 12, 25, 7, window.innerHeight - 50);
                    t.fillStyle = '#333'
                    t.fillRect(window.innerWidth - 12, 25 - domcv.scrollYHeight / maxHeight * (window.innerHeight - 50), 7, (innerHeight - 50) * innerHeight / maxHeight);
                }
            }
            // draw x-scrollbar
            if (domcv.isScrollXDo) {
                if (!isDragX) var isDragX = false;
                if (!isInHoverX) var isInHoverX = false;
                t.fillStyle = '#ddd';
                t.fillRect(window.innerWidth - 15, 0, 15, window.innerHeight);
                t.fillStyle = '#888'
                t.beginPath();
                t.moveTo(window.innerWidth - 8, 15);
                t.lineTo(window.innerWidth - 12, 20);
                t.lineTo(window.innerWidth - 4, 20);
                t.fill();
                t.beginPath();
                t.moveTo(window.innerWidth - 8, window.innerHeight - 15);
                t.lineTo(window.innerWidth - 12, window.innerHeight - 20);
                t.lineTo(window.innerWidth - 4, window.innerHeight - 20);
                t.fill();
                t.fillStyle = '#ddd'
                t.fillRect(25, window.innerHeight - 12, window.innerWidth - 50, 7);
                t.fillStyle = '#888'
                t.fillRect(25 + domcv.scrollXHeight / maxWidth * (innerWidth - 50), window.innerHeight - 12, (innerWidth - 50) * innerWidth / maxWidth, 7);
            }
        }
        var isEndReachedX=!1, isEndReachedY=!1;
        if (-domcv.maxHeight + innerHeight >= domcv.scrollYHeight && domcv.isScrollYDo) {
            isEndReachedY = !0;
        }
        if (-domcv.maxWidth + innerWidth >= domcv.scrollXHeight && domcv.isScrollXDo) {
            isEndReachedX = !0;
        }
        if (-domcv.maxHeight + innerHeight >= domcv.scrollYHeight && domcv.isScrollYDo ||
            -domcv.maxWidth + innerWidth >= domcv.scrollXHeight && domcv.isScrollXDo
        ) {
            domcv.end_reached({endReachedY: isEndReachedY, endReachedX: isEndReachedX})
        }

        domcv.get = function(S) {
            if (S === '*') S = '';
            var P = cssSelector(S);
            return {
                $RAW: P,
                $CHANGE_ATTRS: function(m,l) {
                    for (var i = 0;i < P.length;i++) {
                        let index = doms.indexOf(P[i]);
                        if (index !== -1) {
                            doms[index].attrs[m] = l
                        }
                    }
                    return this;
                },
                $GET_ATTRS: function(m) {
                    let res = [];
                    for (var i = 0;i < P.length;i++) {
                        let index = doms.indexOf(P[i]);
                        if (index !== -1) {
                            res.push(doms[index].attrs[m])
                        }
                    }
                    return res;
                },
                $CHANGE_CONTENT: function(m) {
                    for (var i = 0;i < P.length;i++) {
                        let index = doms.indexOf(P[i]);
                        if (index !== -1) {
                            let children = doms[index].children;
                            for (var j = 0;j < children.length;j++) {
                                for (var k = 0;k < doms.length;k++) {
                                    if (doms[k].dataType === children[j] && 
                                        doms[k].tagName === '::text'
                                    ) {
                                        doms[k].content = m;
                                    }
                                }
                            }
                        }
                    }
                    return m;
                },
                $GET_CONTENT: function(m) {
                    let res = [];
                    for (var i = 0;i < P.length;i++) {
                        let index = doms.indexOf(P[i]);
                        if (index !== -1) {
                            let children = doms[index].children;
                            for (var j = 0;j < children.length;j++) {
                                for (var k = 0;k < doms.length;k++) {
                                    if (doms[k].dataType === children[j] && 
                                        doms[k].tagName === '::text'
                                    ) {
                                        res.push(doms[k].content);
                                    }
                                }
                            }
                        }
                    }
                    return res;
                },
                $GET_INNERHTML: function() {
                    let res = [];
                    for (var i = 0;i < P.length;i++) {
                        let index = doms.indexOf(P[i]);
                        if (index !== -1) {
                            res.push(doms[index].rawEl.innerHTML)
                        }
                    }
                    return res;
                }
            }
        }
    },1000 / 24)
    window.addEventListener("mousewheel", (e) => {
            if (e.deltaY < 0) {
                domcv.scrollYHeight += 25;
            } else {
                domcv.scrollYHeight -= 25;
            }
            domcv.scrollYHeight = Math.min(0, domcv.scrollYHeight)
            domcv.scrollYHeight = Math.max(-domcv.maxHeight + innerHeight, domcv.scrollYHeight);
        })
    console[console.info ? 'info' : 'log'] ('domcv.js loaded successfully')
    isInLoading = false;
    window.domcv = domcv;
})()
