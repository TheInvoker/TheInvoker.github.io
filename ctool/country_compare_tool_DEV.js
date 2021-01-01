function DD_COMPARE_TABLE(OPTIONS) {

    var $ = jQuery;

    $.when(
        $.getScript("https://cdnjs.cloudflare.com/ajax/libs/vue/2.6.12/vue.min.js"),
        $.getScript("https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment-with-locales.min.js"),    
        $.getScript("https://cdn.jsdelivr.net/npm/bowser@2.7.0/es5.min.js"),    
        $.getScript("https://cdn.jsdelivr.net/npm/file-saver@2.0.2/dist/FileSaver.min.js"), 
        //$.getScript("https://cdn.jsdelivr.net/npm/xlsx@0.15.6/dist/xlsx.full.min.js"),    // new version of xlsx.core.js plugin which does not support styling         
        $.getScript("/dentons/flag/flag_54m57l48n51j56q53l56p.action"),  // old version of xlsx.core.js plugin which still supports styling           
        DD_UTILS.getStyle("https://fonts.googleapis.com/icon?family=Material+Icons")
    ).done(function() {
        $.when(
            $.getScript("https://cdn.jsdelivr.net/npm/vue-router@3.4.9/dist/vue-router.min.js"),
            $.getScript("https://cdn.jsdelivr.net/npm/vuetify@2.4.0/dist/vuetify.min.js"),
            $.getScript("/dentons/flag/flag_54p48o48q51n54o52k48l.action")  // xlsx polyfill
        ).done(function() {
            getConfig(async function(res) {
                await init(...res);
            }, function(message) {
                alert(message);
            });
        });
    });

    /**
     * Admin architecture.
     * @param {*} strings 
     * @param {*} data_QA 
     * @param {*} data_C 
     * @param {*} data_AM 
     * @param {*} data_Q 
     */
    function ARCH1(strings, data_QA, data_C, data_AM, data_Q) {

        var arch_obj = this;
        this.data = {};
        this.data_QA = data_QA;
        this.data_C = data_C;
        this.data_AM = data_AM;
        this.data_Q = data_Q;
        
        this.SetUp = function(data_QA, data_C, data_AM, data_Q) {
            var d = DD_UTILS.parseiSheetREST(data_AM);
            var m_list = d.list, m_list_headers = d.headers;
        
            var d = DD_UTILS.parseiSheetREST(data_QA);
            var a_list = d.list, a_list_headers = d.headers, pk_name, fpk_name;
            a_list_headers = a_list_headers.map(function(x) {
                var rx = /\d+(\.\d+)*/;
                var arr = rx.exec(x.name);
                var qid = arr[0];
                var q = x.name.replace(qid, "").trim();
                var cat_id = qid.substr(0, qid.indexOf("."));
                if (q === strings.label_pk) {
                    fpk_name = x.name;
                    pk_name = q;
                }
                return {
                    cid:x.cid,
                    type:x.type,
                    name:q,
                    id:qid,
                    cat_id:cat_id,
                    picker_open:false,
                    updates_since:"",
                    is_dirty:false,
                    open:true
                };
            });
            a_list.forEach(function(x) {
                a_list_headers.forEach(function(a) {
                    var pk = x[fpk_name];
                    var pk_map = arch_obj.data[pk] || {};
                    arch_obj.data[pk] = pk_map;
                    pk_map[a.id] = {
                        answer : x[a.id + " " + a.name], 
                        metadata : m_list.filter(x => x['Question ID']===a.id && x[pk_name]===pk)[0], 
                        _id : x["_id"]
                    };
                });
            });
        
            var d = DD_UTILS.parseiSheetREST(data_C);
            var cat_list = d.list, cat_list_headers = d.headers;
            cat_list = cat_list.map(function(obj) {
                return {
                    _id : obj['_id'],
                    id : obj['Id'],
                    name : obj['Name'],
                    order : obj['Order'],
                    can_exclude : $(obj['Can Exclude']).text() === "Yes",
                    header : $(obj['Header']).text() === "Yes",
                    expanded : $(obj['Expanded']).text() === "Yes",
                    disabled : $(obj['Can Exclude']).text() !== "Yes",
                    children : a_list_headers.filter(function(x) {
                        return parseInt(x.cat_id, 10) === parseInt(obj['Id'], 10);
                    })
                };
            });
        
            // set up data
            arch_obj.regionsAsTreeview = [
                {
                    id:"", 
                    name:strings.label_select_one_or_more,
                    children : Object.keys(arch_obj.data).map(function(key) {
                        return {
                            id : key,
                            name : key
                        };
                    })
                }
            ];
            arch_obj.topicsAsTreeview = [
                {
                    id:"",
                    name:strings.label_select_category,
                    children : cat_list
                }
            ];
        };

        this.SetUp(this.data_QA, this.data_C, this.data_AM, this.data_Q);
    
        function getData(region, qid) {
            var region = arch_obj.data[region];
            if (region) {
                return region[qid];
            } 
        }
    
        this.getData = function(region, qid) {
            return getData(region, qid);
        };
    
        this.getAnswer = function(region, qid) {
            var data = getData(region, qid);
            if (data) return data.answer;
        };

        this.getMetadata = function(region, qid) {
            var data = getData(region, qid);
            if (data) return data.metadata;
        };

        function updateQuestion(vm, access_token) {
            $.ajax({
                url: "/" + DD_UTILS.getInstanceName() + "/api/3/isheet/" + vm.strings.isheet_id_data + "/items?sheetviewid=" + vm.strings.isheet_view_id_data + "&limit=9999",
                headers: {
                    'Authorization':'Bearer ' + access_token
                },
                success : function(data) {
                    arch_obj.data_QA = data;
                    arch_obj.SetUp(arch_obj.data_QA, arch_obj.data_C, arch_obj.data_AM, arch_obj.data_Q);
                },
                error : function (jqXHR, textStatus, errorThrown) { 
                    alert(errorThrown);
                }
            });
        }

        this.editItemHandler = function(vm, pk, qid, access_token) {
            var data = getData(pk, qid);
            DD_UTILS.openEditForm(vm.strings.site_id, vm.strings.isheet_id_data, vm.strings.isheet_view_id_data, data._id, [], function() {
                // save
                updateQuestion(vm, access_token);
            }, function() {
                // close
            }, function(window) {
                // callback
            });
        };

        this.editQuestionHandler = function(vm, question, access_token) {
            var w = window.open("/dentons/siteManager_v4.action?metaData.siteID=" + vm.strings.site_id + "&metaData.parentFolderID=0&metaData.jumpTo=&metaData.modulePage=siteAdminIsheetColumnLoad&sortType=ORDER_ASC&sourceOfAction=contentManager&metaData.linkingType=0&metaData.sheetId=" + vm.strings.isheet_id_data + "&metaData.templateLinkID=0");
            var int = setInterval(function() {
                if (w.closed) {
                    clearInterval(int);
                    updateQuestion(vm, access_token);
                }
            }, 1000);
        };
    }

    /**
     * Basic architecture.
     * @param {*} strings 
     * @param {*} data_QA 
     * @param {*} data_C 
     * @param {*} data_AM 
     * @param {*} data_Q 
     */
    function ARCH2(strings, data_QA, data_C, data_AM, data_Q) {

        var arch_obj = this;
        this.data_QA = data_QA;
        this.data_C = data_C;
        this.data_AM = data_AM;
        this.data_Q = data_Q;
        var m_list;
        
        this.SetUp = function(data_QA, data_C, data_AM, data_Q) {
            var d = DD_UTILS.parseiSheetREST(data_AM);
            m_list = d.list;
            var m_list_headers = d.headers;
        
            var d = DD_UTILS.parseiSheetREST(data_Q);
            var q_list = d.list, q_list_headers = d.headers;
        
            var d = DD_UTILS.parseiSheetREST(data_C);
            var cat_list = d.list, cat_list_headers = d.headers;
            cat_list = cat_list.map(function(obj) {
                return {
                    _id : obj['_id'],
                    id : obj['Id'],
                    name : obj['Name'],
                    order : obj['Order'],
                    can_exclude : $(obj['Can Exclude']).text() === "Yes",
                    header : $(obj['Header']).text() === "Yes",
                    expanded : $(obj['Expanded']).text() === "Yes",
                    disabled : $(obj['Can Exclude']).text() !== "Yes",
                    children : q_list.reduce(function(acc, x) {
                        var cat_id = x["Category ID"];
                        if (parseInt(cat_id, 10) === parseInt(obj['Id'], 10)) {
                            var new_obj = {};
                            Object.assign(new_obj, x);
                            new_obj['id'] = new_obj['Question ID'];
                            new_obj['name'] = new_obj['Question'];
                            new_obj['picker_open'] = false;
                            new_obj['updates_since'] = "";
                            new_obj['is_dirty'] = false;
                            new_obj['open'] = true;
                            acc.push(new_obj);
                        }
                        return acc;
                    }, [])
                };
            });
        
            // set up data
            var c = {};
            arch_obj.regionsAsTreeview = [
                {
                    id:"", 
                    name:strings.label_select_one_or_more,
                    children : m_list.reduce(function(acc, x) {
                        var name = x[strings.label_pk];
                        if (!c[name]) {
                            c[name] = 1;
                            acc.push({
                                id : name,
                                name: name
                            });
                        }
                        return acc;
                    }, []).sort(function(a,b) {
                        if (a.name>b.name) return 1;
                        if (a.name<b.name) return -1;
                        return 0;
                    })
                }
            ];
            arch_obj.topicsAsTreeview = [
                {
                    id:"",
                    name:strings.label_select_category,
                    children : cat_list
                }
            ];
        };

        this.SetUp(this.data_QA, this.data_C, this.data_AM, this.data_Q);
    
        function getData(region, qid) {
            return m_list.filter(function(x) {
                return x[strings.label_pk] === region && x['Question ID'] === qid;
            })[0];
        }
    
        this.getAnswer = function(region, qid) {
            var d = getData(region, qid);
            if (d) return d['Answer'];
        };

        this.getMetadata = function(region, qid) {
            return getData(region, qid);
        };

        function updateQuestion(vm, access_token) {
            $.ajax({
                url: "/" + DD_UTILS.getInstanceName() + "/api/3/isheet/" + vm.strings.isheet_id_question + "/items?sheetviewid=" + vm.strings.isheet_view_id_question + "&limit=9999",
                headers: {
                    'Authorization':'Bearer ' + access_token
                },
                success : function(data) {
                    arch_obj.data_Q = data;
                    arch_obj.SetUp(arch_obj.data_QA, arch_obj.data_C, arch_obj.data_AM, arch_obj.data_Q);
                },
                error : function (jqXHR, textStatus, errorThrown) { 
                    alert(errorThrown);
                }
            });
        }

        this.editItemHandler = function(vm, pk, qid, access_token) {
            vm.editMetadataItemHandler(pk, qid);
        };

        this.editQuestionHandler = function(vm, question, access_token) {
            DD_UTILS.openEditForm(vm.strings.site_id, vm.strings.isheet_id_question, vm.strings.isheet_view_id_question, question._id, [
                {
                    name : "Question ID",
                    readonly : true
                }
            ], function() {
                // save
                updateQuestion(vm, access_token);
            }, function() {
                // close
            }, function(window) {
                // callback
            });
        };
    }

    /**
     * Get config data.
     * @param {*} success 
     * @param {*} fail 
     */
    function getConfig(success, fail) {
        $.ajax({
            url: OPTIONS.config_url, 
            dataType: "xml",
            success : function(data) {
                var strings = DD_UTILS.getStringsObject(data);
                DD_UTILS.OAuth2Flow(OPTIONS, strings, async function(access_token) {
                    try {
                        const res = await preInitApp(strings, access_token);
                        success(res);
                    } catch (err) {
                        fail(err);
                    }
                }, function(message) {
                    fail(message);
                }, true);
            }, 
            error : function(jqXHR, textStatus, errorThrown) {
                fail(errorThrown);
            }
        });
    }

    /**
     * Get resources.
     * @param {*} strings 
     * @param {*} access_token 
     */
    async function preInitApp(strings, access_token) {

        var headers = {
            //'Accept': 'application/json',
            'Authorization':'Bearer ' + access_token
        };

        var arr = ["/" + DD_UTILS.getInstanceName() + "/api/3/isheet/" + strings.isheet_id_category + "/items?sheetviewid=" + strings.isheet_view_id_category + "&limit=9999",
                   "/" + DD_UTILS.getInstanceName() + "/api/3/isheet/" + strings.isheet_id_metadata + "/items?sheetviewid=" + strings.isheet_view_id_metadata + "&limit=9999"];
        
        if (strings.config_use_admin_architecture === "1") {
            arr.push("/" + DD_UTILS.getInstanceName() + "/api/3/isheet/" + strings.isheet_id_data + "/items?sheetviewid=" + strings.isheet_view_id_data + "&limit=9999");
        } else {
            arr.push("/" + DD_UTILS.getInstanceName() + "/api/3/isheet/" + strings.isheet_id_question + "/items?sheetviewid=" + strings.isheet_view_id_question + "&limit=9999");
        }

        const res = await Promise.all(arr.map(async url => await (await fetch(url, {headers})).text()));

        if (strings.config_use_admin_architecture === "1") {
            return [strings, access_token, res[2], res[0], res[1], undefined];
        } else {
            return [strings, access_token, undefined, res[0], res[1], res[2]];
        }
    }

    async function init(strings, access_token, data, category_data, meta_data, question_data) {

        Vue.component('meta-data', {
            props : ['strings', 'updates_since', 'metadata', 'edit_mode', 'item', 'color', 'show_mobile'],
            template: `    
                <div>
                    <v-divider class="mt-4" v-if="showDivider()"></v-divider>
                    <div align="right" v-if="showEditButton()" class="display-none-print">
                        <v-btn text icon :color="color" @click="editMetadataItemHandler">
                            <v-icon>edit</v-icon>
                        </v-btn> 
                    </div>
                    <div v-if="metadata">
                        <div class="font-weight-bold red--text" v-if="isNew && strings.config_enable_updates_since == '1'">{{strings.label_new_value}}</div>
                        <div v-if="metadata['Last Updated']">
                            {{strings.label_last_updated}}: {{metadata['Last Updated']}}
                        </div>
                        <div v-if="metadata['Authors']" v-html="strings.label_authors + ': ' + metadata['Authors']"></div>
                    </div>
                </div>`,
            computed : {
                isNew : function() {
                    var lu = this.metadata['Last Updated'];
                    var ud = this.updates_since;
                    if (lu && ud) {
                        return new Date(lu) >= new Date(ud);
                    }
                    return false;
                }
            },
            methods: {
                showEditButton : function() {
                    return this.edit_mode && !this.show_mobile;
                },
                showDivider : function() {
                    if (this.showEditButton()) {
                        return true;
                    }
                    return this.metadata && ((this.isNew && this.strings.config_enable_updates_since == '1') || this.metadata['Last Updated'] || this.metadata['Authors']);
                },
                editMetadataItemHandler : function() {
                    this.$emit("edit");
                }
            }
        });
    
        Vue.component('read-more', {
            props : ['strings', 'contents', 'print_mode', 'color'],
            template : `
                <div v-resize="onResize" :class="[{'ddct_read_more_closed':enabled && !open && !print_mode}]">
                    <div class="ddct_read_more_content_wrapper">
                        <div v-html="contents"></div>
                        <div class="ddct_read_more_content_overlay"></div>
                    </div>
                    <v-btn v-if="enabled && !print_mode" text small dense :color="color" @click="open=!open">{{open ? strings.link_read_less : strings.link_read_more}}</v-btn>
                </div>`,
            mounted : function() {
                this.setEnabled();
            },
            data : function() {
                return {
                    enabled : false,
                    open : false
                };
            },
            methods : {
                onResize : function() {
                    if (!this.print_mode) {
                        this.setEnabled();
                    }
                },
                setEnabled : function() {
                    this.enabled = this.$el.querySelector(".ddct_read_more_content_wrapper").clientHeight > this.strings.config_read_more_less_max_length;
                }
            }
        });
    
        Vue.component('updates-since', {
            props : ['item', 'strings', 'color'],
            template : `
                <div class="overflow-hidden d-flex">
                    <v-btn icon :color="color" @click="show">
                        <v-icon>{{ item.open ? 'chevron_right' : 'chevron_left' }}</v-icon>
                    </v-btn>
                    <v-menu v-model="item.picker_open" :close-on-click="false" :close-on-content-click="false" max-width="290" content-class="z-index-9999 position-fixed" :attach="root">
                        <template v-slot:activator="{ on }">
                            <transition name="fade">
                                <div v-show="item.open" class="text-no-wrap">
                                    {{strings.label_how_recent}} 
                                    <v-btn small text :color="color" v-on="on">
                                        <v-icon left>calendar_today</v-icon> {{item.updates_since}}
                                    </v-btn>
                                    <v-btn icon :color="color" @click="refresh">
                                        <v-icon>refresh</v-icon>
                                    </v-btn>
                                </div>
                            </transition>
                        </template>
                        <v-card :color="color">
                            <v-card-actions class="pa-0">
                                <v-spacer></v-spacer>
                                <v-btn text icon dark @click="item.picker_open = false">
                                    <v-icon>clear</v-icon>
                                </v-btn>
                            </v-card-actions>
                            <v-date-picker next-icon="navigate_next" prev-icon="navigate_before" :color="color" v-model="item.updates_since" @change="dateChange"></v-date-picker>
                        </v-card>
                    </v-menu>
                </div>`,
            data : function() {
                return {
                    root : false
                };
            },
            mounted : function() {
                this.root = this.$el;
            },
            methods : {
                dateChange: function() {
                    this.item.is_dirty = true;
                    this.$emit('change', this.item);
                },
                refresh : function() {
                    this.item.updates_since = moment().subtract(2, 'week').format("YYYY-MM-DD");
                    this.item.is_dirty = false;
                    this.$emit('change', this.item);
                },
                show : function() {
                    this.item.open = !this.item.open;
                }
            }
        });
    
        var RC = Vue.component('region-compare', {
            template: await (await fetch("https://www.greennightsky.com/ctool/country_compare_tool_DEV.html")).text(),
            data: function() {
                return {
                    color : this.$vuetify.theme.themes.light.primary,
                    offsetTop : 0,
                    edit_mode : this.$route.query.edit === '1',
                    show_mobile : this.isMobile(),
                    print_mode : false,
                    arch : strings.config_use_admin_architecture === "1" ? new ARCH1(strings, data, category_data, meta_data, question_data) : new ARCH2(strings, data, category_data, meta_data, question_data),
                    strings : strings,
                    keyContacts : [],
                    region_search:"",
                    region_open_node_keys : [""],
                    region_value : this.getPKsFromURL(this.$route),
                    topic_search:"",
                    topic_open_node_keys : [""],
                    topic_value : [],
                    updates_since_value : [],
                    update_table_timeout : -1,
                    show_print_disclaimer : false
                };
            },
            mounted : function() {
                var fs_url = this.getFsFromURL(this.$route);
                this.topic_value = this.getInvertedFsFromURL(fs_url);
                this.topic_open_node_keys = this.getDefaultOpenNodesTopics();
                this.syncDs(this.$route);
    
                var vm = this;
    
                window.matchMedia('print').onchange = function(e) {  
                    if (!e.matches) {
                        vm.show_print_disclaimer = false;
                    } else if (!vm.print_mode) { // if manually gone into print mode
                        vm.show_print_disclaimer = true;
                    }
                    vm.print_mode = e.matches;
                    vm.updateIsMobile();
                }
    
                $(window).resize(function (e) {
                    vm.updateIsMobile();
                    vm.updateTableCellStyles();
                });
    
                this.updateTitle();
                this.getUserDetails();
                this.updateIsMobile();
                this.updateTableCellStyles();
    
                // if any regions selected, scroll to table
                if (this.region_value.length > 0) {
                    this.$nextTick(function() {
                        setTimeout(function() {
                            vm.$el.querySelector(".ddct_table_wrapper").scrollIntoView({
                                behavior : "smooth"
                            });
                        }, 2000);
                    });
                }
            },
            beforeRouteUpdate : function(to, from, next) {
                var new_pks_vals = this.getPKsFromURL(to);
                if (this.region_value.join(",") !== new_pks_vals.join(",")) {
                    this.region_value = new_pks_vals;
                }
                var new_fs_vals = this.getInvertedFsFromURL(this.getFsFromURL(to));
                if (this.topic_value.join(",") !== new_fs_vals.join(",")) {
                    this.topic_value = new_fs_vals;
                }
                var new_ds_vals = this.getDsFromURL(to);
                if (this.getDsList().join(",") !== new_ds_vals.join(",")) {
                    this.syncDs(to);
                }
                next();
            },
            computed : {
                getRegions : function() {
                    return this.region_value.map(x=>x).sort();
                }
            },
            methods : {
                getUserDetails : function () {
                    var vm = this;
                    var emails = this.strings.emails_key_contacts;
                    if (emails) {
                        var email_list = emails.split(",");
                        $.when.apply($, email_list.map(function(email, i) {
                            return $.ajax({
                                url: "/" + DD_UTILS.getInstanceName() + "/api/3/users/" + email.trim() + "?type=email",
                                headers: {
                                    //'Accept': 'application/json',
                                    'Authorization':'Bearer ' + access_token
                                }
                            });
                        })).then(function() {
                            var data_list = email_list.length <= 1 ? [arguments] : arguments;
                            for(var i=0; i<data_list.length; i+=1) {
                                var data = data_list[i][0];
                                data = $(data);
                                vm.keyContacts.push({
                                    firstname : data.find("firstname").text(),
                                    lastname : data.find("lastname").text(),
                                    jobtitle : data.find("jobtitle").text(),
                                    email : data.find("email").text(),
                                    image : DD_UTILS.getUserImage(data.find("userid").text(), "64"),
                                    image_failed : false
                                });
                            }
                        });
                    }
                },
                getListFromURL : function(query) {
                    var query_list = [];
                    if (query) {
                        query.split(",").map(function(x) { 
                            x = x.trim();
                            if (x) {
                                query_list.push(x);
                            }
                        });
                    }
                    return query_list;
                },
                getInvertedFsFromURL : function(compare_list) {
                    var vm = this;
                    return this.getAllTreeKeys(this.arch.topicsAsTreeview, [], function(root) {
                        return !root.hasOwnProperty('children') && root.name !== vm.strings.label_pk;
                    }, function(root) {
                        return root.id;
                    }).filter(function(x) {
                        return compare_list.indexOf(x) === -1;
                    });
                },
                getPKsFromURL : function(route) {
                    return this.getListFromURL(route.query.pks);
                },
                getFsFromURL : function(route) {
                    return this.getListFromURL(route.query.fs);
                },
                getDsFromURL : function(route) {
                    return this.getListFromURL(route.query.ds);
                },
                syncDs : function(route) {
                    var date = moment().subtract(2, 'week').format("YYYY-MM-DD");
                    var ds_list = this.getDsFromURL(route);
                    this.getAllTreeKeys(this.arch.topicsAsTreeview, [], function(root) { 
                        if (!root.hasOwnProperty('children')) {
                            var found = false;
                            ds_list.map(function(d) {
                                var obj = d.split("|");
                                if (root.id === obj[0]) {
                                    root.updates_since = obj[1];
                                    root.is_dirty = true;
                                    found = true;
                                } 
                            });
                            if (!found) {
                                root.updates_since = date;
                                root.is_dirty = false;
                            }
                        }
                        return true;
                    }, function(root) {
                        return root.id;
                    });
                },
                regionChange : function(list) {
                    if (list.join(",") !== this.getPKsFromURL(this.$route).join(",")) {
                        this.updateLink({ 
                            pks: list.length > 0 ? list.join(",") : undefined,  
                            fs: this.$route.query.fs,
                            ds : this.$route.query.ds
                        });
                        this.updateTitle();
                        this.updateTableCellStyles(); 
                    }
                },
                topicChange : function(list) {
                    var new_list = [];
                    this.arch.topicsAsTreeview[0].children.forEach(x => {
                        x.children.forEach(y => {
                            if (!x.can_exclude || list.indexOf(y.id) !== -1) {
                                new_list.push(y.id);
                            }
                        });
                    });
    
                    var inv_new_list = this.getInvertedFsFromURL(new_list);
                    if (inv_new_list.join(",") !== this.getFsFromURL(this.$route).join(",")) {
                        this.updateLink({ 
                            pks: this.$route.query.pks,  
                            fs: inv_new_list.length > 0 ? inv_new_list.join(",") : undefined,
                            ds : this.$route.query.ds
                        });
                        this.updateTableCellStyles();
                    }
                },
                getDsList : function() {
                    return this.getAllTreeKeys(this.arch.topicsAsTreeview, [], function(root) { 
                        return !root.hasOwnProperty('children') && root.is_dirty;
                    }, function(root) { 
                        return root.id + "|" + root.updates_since; 
                    });
                },
                dateChange : function(item) {
                    item.picker_open = false;
                    var list = this.getDsList();
                    if (list.join(",") !== this.getDsFromURL(this.$route).join(",")) {
                        this.updateLink({ 
                            pks: this.$route.query.pks,  
                            fs: this.$route.query.fs,
                            ds : list.length > 0 ? list.join(",") : undefined
                        });
                    }
                },
                updateTitle : function() {
                    var pks = this.region_value.join(this.strings.label_title_join_delimiter);
                    document.title = this.strings.label_title + (pks.length > 0 ? ": " + pks : "");
                },
                getSelectedTopicQuestions : function(category) {
                    return category.children.filter((x) => {
                        return this.topic_value.indexOf(x.id) !== -1;
                    });
                },
                getDefaultOpenNodesTopics : function() {
                    return this.arch.topicsAsTreeview[0].children.reduce(function(acc, x) {
                        if (x.expanded && x.can_exclude) {
                            acc.push(x.id);
                        }
                        return acc;
                    }, [""]);
                }, 
                getAllTreeKeys : function(root, list, check, add) {
                    for(var i=0; i<root.length; i++) {
                        if (check(root[i])) {
                            list.push(add(root[i]));
                        }
                        if (root[i].children) {
                            this.getAllTreeKeys(root[i].children, list, check, add);
                        }
                    }
                    return list;
                },
                updateLink : function(query) {
                    this.$router.push({ path: window.location.pathname + window.location.search + window.location.hash, query: query}).catch(err => {
                        //if (err.name !== "NavigationDuplicated") {
                            console.error(err);
                        //}
                    });
                },
                expandAll : function() {
                    this.region_open_node_keys = [""];
                    this.topic_open_node_keys = this.getAllTreeKeys(this.arch.topicsAsTreeview, [], function(root) { 
                        return !root.hasOwnProperty("can_exclude") || root.can_exclude; 
                    }, function(root) { return root.id; });
                },
                collapseAll : function() {
                    this.topic_open_node_keys = [""];
                },
                startOver : function() {
                    this.updateLink({ 
                        pks : undefined,
                        fs : undefined,
                        ds : undefined
                    });
    
                    this.region_open_node_keys = [""];
                    this.topic_open_node_keys = this.getDefaultOpenNodesTopics();
    
                    this.getAllTreeKeys(this.arch.topicsAsTreeview, [], function(root) { 
                        if (!root.hasOwnProperty('children')) {
                            root.open = true;
                        }
                        return true;
                    }, function(root) { 
                        return root.id; 
                    });
                },
                print : function() {
                    this.print_mode = true;
                    this.updateIsMobile();
                    this.$nextTick(function() {
                        window.print();
                    });
                },
                copy : function() {
                    var dummy = document.createElement('input'),
                    text = window.location.href;
                    document.body.appendChild(dummy);
                    dummy.value = text;
                    dummy.select();
                    document.execCommand('copy');
                    document.body.removeChild(dummy);
                    alert(this.strings.alert_copied_link);
                },
                download : function() {
                    // TODO enable multi line
                    var rows = [], opts = [];
                    for(var i=0; i<this.arch.topicsAsTreeview[0].children.length; i++) {
                        var category = this.arch.topicsAsTreeview[0].children[i];
                        var topics = this.getSelectedTopicQuestions(category);
                        if (topics.length > 0) {
                            var row1 = [category.name];
                            var optrow1 = [this.getExcelStyleHeader()];
                            for(var k=0; k<this.getRegions.length; k++) {
                                var pk = this.getRegions[k];
                                row1.push(pk);
                                optrow1.push(this.getExcelStyleHeader());
                            }
                            rows.push(row1);
                            opts.push(optrow1);
                            for(var j=0; j<topics.length; j++) {
                                var topic = topics[j];
                                var row2 = [topic.name];
                                var optrow2 = [this.getExcelStyleQuestion(j%2===0)];
                                for(var k=0; k<this.getRegions.length; k++) {
                                    var pk = this.getRegions[k];
                                    var answer = this.arch.getAnswer(pk, topic.id) || "";
                                    var metadata = this.arch.getMetadata(pk, topic.id) || "";
                                    row2.push(answer + (metadata ? "\r\n\r\n " + this.strings.label_authors + ": " + metadata["Authors"] + " " + this.strings.label_last_updated + ": " + metadata["Last Updated"] : ""));
                                    optrow2.push(this.getExcelStyleCell(j%2===0));
                                }
                                rows.push(row2);
                                opts.push(optrow2);
                            }
                        }
                    }
                    this.exportToExcel([{
                        name: this.strings.label_title,
                        data : rows,
                        opts : opts
                    }], document.title.replace(/\./g, ""));
                },
                exportToExcel : function(sheets, filename, opts) {
                    var filename = filename + ".xlsx";
                    var wb = XLSX.utils.book_new();
                    sheets.map(function(s) {
                        var ws = XLSX.utils.aoa_to_sheet(s.data, s.opts, function(R, C, opts) {
                            return opts[R][C];
                        });
                        XLSX.utils.book_append_sheet(wb, ws, s.name);
                    });
                    var wopts = { bookType:'xlsx', bookSST:false, type:'binary' };
                    var wbout = XLSX.write(wb,wopts);
                    saveAs(new Blob([XLSX.utils.s2ab(wbout)],{type:"application/octet-stream"}), filename);
                },
                getExcelStyleHeader : function() { // https://openbase.io/js/xlsx-style
                    return {
                        fill:{
                            fgColor:{ rgb: '6E2D91' }
                        },
                        font: {
                            color: {
                                rgb: 'FFFFFF'
                            }
                        },
                        border: this.getExcelBorder()
                    };
                },
                getExcelStyleQuestion : function(even) {
                    return {
                        fill: !even ? {
                            fgColor:{ rgb: 'f4f4f4' }
                        } : undefined,
                        font: {
                            bold: true
                        },
                        border: this.getExcelBorder()
                    };
                },
                getExcelStyleCell : function(even) {
                    return {
                        fill: !even ? {
                            fgColor:{ rgb: 'f4f4f4' }
                        } : undefined,
                        border: this.getExcelBorder()
                    };
                },
                getExcelBorder : function() {
                    return {
                        top: { style: "thin", color: { rgb:'dddddd' } },
                        bottom: { style: "thin", color: { rgb:'dddddd' } },
                        left: { style: "thin", color: { rgb:'dddddd' } },
                        right: { style: "thin", color: { rgb:'dddddd' } }
                    };
                },
                onScroll : function(event) {
                    this.offsetTop = window.scrollY;
                },
                scrollUp : function(event) {
                    window.scrollTo({
                        top: 0,
                        left: 0,
                        behavior: 'smooth'
                    });
                },
                isMobile : function() {
                    return (!this.print_mode && window.matchMedia("(max-width: 960px)").matches) || (this.print_mode && this.region_value.length > 3);
                },
                updateIsMobile : function() {
                    this.show_mobile = this.isMobile();
                },
                isEven : function(i) {
                    return i % 2 === 0;
                },
                updateCategory : function() {
                    var vm = this;
                    $.ajax({
                        url: "/" + DD_UTILS.getInstanceName() + "/api/3/isheet/" + vm.strings.isheet_id_category + "/items?sheetviewid=" + vm.strings.isheet_view_id_category + "&limit=9999",
                        headers: {
                            'Authorization':'Bearer ' + access_token
                        },
                        success : function(data) {
                            vm.arch.data_C = data;
                            vm.arch.SetUp(vm.arch.data_QA, vm.arch.data_C, vm.arch.data_AM, vm.arch.data_Q); 
                        },
                        error : function (jqXHR, textStatus, errorThrown) { 
                            alert(errorThrown);
                        }
                    });   
                },
                updateMetadata : function() {
                    var vm = this;
                    $.ajax({
                        url: "/" + DD_UTILS.getInstanceName() + "/api/3/isheet/" + vm.strings.isheet_id_metadata + "/items?sheetviewid=" + vm.strings.isheet_view_id_metadata + "&limit=9999",
                        headers: {
                            'Authorization':'Bearer ' + access_token
                        },
                        success : function(data) {
                            vm.arch.data_AM = data;
                            vm.arch.SetUp(vm.arch.data_QA, vm.arch.data_C, vm.arch.data_AM, vm.arch.data_Q);
                            vm.syncDs(vm.$route);
                        },
                        error : function (jqXHR, textStatus, errorThrown) { 
                            alert(errorThrown);
                        }
                    });
                },
                editItemHandler : function(pk, qid) {
                    this.arch.editItemHandler(this, pk, qid, access_token);
                },
                editQuestionHandler : function(question) {
                    this.arch.editQuestionHandler(this, question, access_token);
                },
                editCategoryHandler : function(category) {
                    var vm = this;
                    DD_UTILS.openEditForm(this.strings.site_id, this.strings.isheet_id_category, this.strings.isheet_view_id_category, category._id, [
                        {
                            name : "Id",
                            readonly : true
                        }
                    ], function() {
                        vm.updateCategory();
                    }, function() {
                        // close
                    }, function(window) {
                        // callback
                    });
                },
                editMetadataItemHandler : function(pk, qid) {
                    var vm = this;
                    var md = this.arch.getMetadata(pk, qid);
                    var form_data = [
                        {
                            name : "Question ID",
                            readonly : true,
                            value : qid
                        },
                        {
                            name : this.strings.label_pk,
                            readonly : true,
                            value : pk
                        }
                    ];
                    if (md) { // metadata item exists
                        DD_UTILS.openEditForm(this.strings.site_id, this.strings.isheet_id_metadata, this.strings.isheet_view_id_metadata, md._id, form_data, function() {
                            vm.updateMetadata();
                        }, function() {
                            // close
                        }, function(window) {
                            // callback
                        });
                    } else { // metadata item does not exist
                        DD_UTILS.openAddForm(this.strings.site_id, this.strings.isheet_id_metadata, this.strings.isheet_view_id_metadata, form_data, function() {
                            vm.updateMetadata();
                        }, function() {
                            // close
                        }, function(window) {
                            // callback
                        });
                    }
                },
                updateTableCellStyles : function() {
                    clearTimeout(this.update_table_timeout);
                    this.update_table_timeout = setTimeout(() => {
                        var els = this.$el.querySelectorAll(".ddct_table_wrapper .ddct_table_sticky .ddct_table_cell");
                        this.updateCell(els);
                    }, 100);
                },
                updateCell : function(els) {
                    var flag = null;
                    var dd_header = $(".topHeader").outerHeight();
                    for(var i=0; i<els.length; i+=1) {
                        // calculate top
                        var td = els[i];
                        td.style.position = "static";
                        var is_header = $(td).hasClass("ddct_header_cell");
                        var is_category = $(td).hasClass("ddct_table_category");
                        var val = $(td).position().top;
                        if (!is_header && is_category) {
                            if (flag == null) flag = val;
                            val = flag;
                        }
                        td.style.position = "";
                        td.style.top = ((is_header || is_category) ? (val+dd_header) : "-999999") + "px";
    
                        // calculate z-index
                        var data_code = td.getAttribute("data-code");
                        var seg = JSON.parse(data_code);
                        var val = seg[3] + 1;
                        if (seg[0]) val += seg[4] + 1;
                        if (seg[1]) val++;
                        if (seg[2]) val++;
                        td.style.zIndex = val;
                    }
                }
            }
        });    

        var elementRef = document.querySelector(OPTIONS.container);
        var shadow = elementRef.attachShadow({mode: 'closed'});
        shadow.innerHTML = `
            <link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/icon?family=Material+Icons"/>
            <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/vuetify@2.4.0/dist/vuetify.min.css"/>   
            <link rel="stylesheet" type="text/css" href="/dentons/flag/flag_8051.action"/>   
            <link rel="stylesheet" type="text/css" href="https://www.greennightsky.com/ctool/country_compare_tool_DEV.css"/>   
            <div id="app">
                <router-view></router-view>
            </div>
        `;
        var el = shadow.getElementById("app");

        document.head.appendChild(DD_UTILS.makeCSS(`
            html {
                font-size:18.67px;
            }
            .panelWrapper .ckContentArea {
                overflow-x:initial;
            }
            .userinfoDropdown {
                position:fixed;
                transform:translateY(20px);
            }
            @media (min-width: 768px) { 
                .userinfoDropdown {
                    transform:translateY(38px);
                }
            }
            @media print {
                html, body {
                    background:white;
                }
                .header, .breadCrumbNav, .headPageTitle, .footer, #siteDashboardPageIframe, .userinfoDropdown {
                    display:none !important;
                }
                * {
                    margin:0 !important;
                    padding:0 !important;
                    width:auto !important;
                    height:auto !important;
                    max-width:none !important;
                    max-height:none !important;
                }
            }
            @page {
                margin: 10px;
            }
        `));

        new Vue({
            el: el,
            vuetify: new Vuetify({
                theme: {
                    themes: {
                        light: {
                            primary: '#6E2D91'
                        }
                    }
                },
                icons : {
                    iconfont : 'md'
                }
            }),
            router : new VueRouter({
                mode: 'history',
                routes : [
                    {
                        path: "*",
                        component : RC
                    }
                ]
            })
        });
    }
}

//# sourceURL=PkGuideTool.js