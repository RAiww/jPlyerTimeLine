/* jPlyerTimeLine 撥放器時間軸 v0.0.0 */
/*! jPlyerTimeLine - RAiww. MIT @license: ra.iww.twbbs.org/ffish/MIT_License. */

"use strict";

    function jPlyerTimeLine( jArguList ){
        let i = this;
        
        [   [ 'isVideoReady', true ],
            [ 'isLive', false ],
            [ 'isLivePlayback', false ],
            [ 'isCumulativeBuffer', false ],
            [ 'lazyPlayTime', 300 ],
        ].map(function( jItem ){
            let jName = jItem[0],
                jVal = jItem[1],
                jType = typeof jVal;
            
            i[ '_hide_' + jName ] = jVal;
            i.checkArgu_correctType( i, '_hide_' + jName, jType, jArguList[ jName ] );
        });
        
        i._hide_bufferPercentList = {
            already: 0,
            timeCurrent: 0,
        };
        
        i._hide_isDrag = false;
        
        
        [ 'buffer', 'timeLine', 'play' ].map(function( jItem ){
            i[ '_hide_' + jItem + 'ID' ] = [ null ];
        });
        
        
        let jArguNameList = [
                'HElem_progress', 'HElem_floatShow',
                'HElem_buffer', 'HElem_play',
                'play', 'isPaused', 'setCurrentPlayShow',
                'vodBuffer',
                'vodDuration', 'vodCurrent',
            ];
        
        if( i._hide_isLivePlayback )
            jArguNameList.push( 'liveDuration', 'liveCurrent' );
        
        i.checkInitArgu( jArguList, jArguNameList, '錯誤使用。' );
        
        
        i.duration = i.vodDuration;
        i.current = i.vodCurrent;
        
        i.evtBindList = i.getEvtBindList();
        i.evtBind('add');
        
        i.initState();
    }
    
    //設定參數
    jz.sCode.protoPlant( jPlyerTimeLine, {
        setIsVideoReady: function( ChoA ){
            let i = this,
                jTemValue = i._hide_isVideoReady,
                isVideoReady = i.checkArgu_correctType( this, '_hide_isVideoReady', 'boolean', ChoA );
            
            if( isVideoReady !== jTemValue ){
                if( isVideoReady ) i.removeClass('esNoReady');
                else i.addClass('esNoReady');
            }
            
            return isVideoReady;
        },
        set isVideoReady( ChoA ){ this.setIsVideoReady( ChoA ); },
        get isVideoReady(){ return this._hide_isVideoReady; },
        setIsLive: function( ChoA ){
            let i = this,
                jTemValue = i._hide_isLive,
                isLive = i.checkArgu_correctType( i, '_hide_isLive', 'boolean', ChoA );
            
            if( isLive !== jTemValue )
                i.setVideoType( isLive );
            
            return isLive;
        },
        set isLive( ChoA ){ this.setIsLive( ChoA ); },
        get isLive(){ return this._hide_isLive; },
    } );
    
    //執行函數
    jz.sCode.protoPlant( jPlyerTimeLine, {
        //改變撥放條顯示
        initState: function(){
            let i = this,
                isLive = i._hide_isLive;
            
            if( i._hide_isVideoReady ) i.removeClass('esNoReady');
            else i.addClass('esNoReady');
            
            i.setVideoType( isLive );
        },
        streamBufferChange: function(){
            let i = this;
            if( !i._hide_isVideoReady || i._hide_isLive ) return;
            
            i.setBufferShow_vod();
        },
        timeChange: function( jCurrent ){
            let i = this;
            
            if( !i._hide_isVideoReady ) return;
            if( i._hide_isLive && !i._hide_isLivePlayback ) return;
            
            let jInf = i.getStandardInf( jCurrent );
            jInf.state = 'timeUpdate';
            
            i.setTimeLineShow( jInf );
            i.setCurrentPlayShow( jInf );
        },
        //拖拉事件
        evtBind: function( jMethod ){
            if( jMethod !== 'add' && jMethod !== 'remove' ) return;
            
            let i = this;
            jz.wCode.evtBind( i.HElem_progress, jMethod, i.evtBindList );
        },
        evtBineFunc: function( evt, jSupmntList ){
            let i = this;
            if( !i._hide_isVideoReady ) return;
            if( i._hide_isLive && !i._hide_isLivePlayback ) return;
            
            let jInf = i.getEvtStandardInf( evt ),
                isShowChange = true;
            switch( evt.type ){
                case 'mouseenter':
                    jInf.state = 'hover';
                    jSupmntList.isSetClass_esFloat = true;
                    
                    i.addClass('esFloat');
                    break;
                case 'mousedown':
                    jInf.state = 'preview';
                    jSupmntList.isPaused = i.isPaused();
                    i._hide_isDrag = true;
                    
                    if( !jSupmntList.isPaused ) i.play( false );
                    i.removeClass('esFloat');
                    i.addClass('esDrag');
                    break;
                case 'mousemove':
                    if( jSupmntList.isHoverState ){
                        if( i._hide_isDrag ) return;
                        jInf.state = 'hover';
                    }else{
                        jInf.state = 'preview';
                        
                        i.playActFilter( jInf );
                    }
                    break;
                case 'mouseup':
                    jInf.state = 'preview';
                    isShowChange = false;
                    i._hide_isDrag = false;
                    
                    i.removeClass('esDrag');
                    if( jSupmntList.isSetClass_esFloat ) i.addClass('esFloat');
                    if( !jSupmntList.isPaused ) i.play( true );
                    
                    i.playActFilter( jInf, 0 );
                    break;
                case 'mouseleave':
                    jInf.state = 'hover';
                    isShowChange = false;
                    
                    if( jSupmntList.isSetClass_esFloat ){
                        jSupmntList.isSetClass_esFloat = false;
                        i.removeClass('esFloat');
                    }
                    break;
            }
            
            if( isShowChange ) i.setTimeLineShow( jInf );
            i.setCurrentPlayShow( jInf );
        },
    } );
    
    //功能性函數
    jz.sCode.protoPlant( jPlyerTimeLine, {
        checkInitArgu: function( jArguList, jArguNameList, errMes ){
            let p = 0, jName, jItem;
            while( jName = jArguNameList[ p++ ] ){
                if( jItem = jArguList[ jName ] ) this[ jName ] = jItem;
                else if( errMes ) throw Error( errMes );
            }
        },
        checkArgu_correctType: function( jMain, jProp, jType, ChoA ){
            jType = typeof ChoA === jType;
            
            if( jType ) jMain[ jProp ] = ChoA;
            else ChoA = jMain[ jProp ];
            
            return ChoA;
        },
        addClass: function(){
            let jMain = this.HElem_progress.classList;
            jMain.add.apply( jMain, arguments );
        },
        removeClass: function(){
            let jMain = this.HElem_progress.classList;
            jMain.remove.apply( jMain, arguments );
        },
        animFPS: function( jIDIndex, FuncA ){
            jIDIndex = this[ '_hide_' + jIDIndex + 'ID' ];
            let jID = jIDIndex[0];
            if( jID ) cancelAnimationFrame( jID );
            
            jIDIndex[0] = requestAnimationFrame(function(){
                jIDIndex[0] = null;
                FuncA();
            });
        },
        actFilter: function( jIDIndex, FuncA, jTimeMS ){
            jIDIndex = this[ '_hide_' + jIDIndex + 'ID' ];
            let jID = jIDIndex[0];
            if( jID ) clearTimeout( jID );
            
            jIDIndex[0] = setTimeout( function(){
                jIDIndex[0] = null;
                FuncA();
            }, jTimeMS );
        },
    } );
    
    jz.sCode.protoPlant( jPlyerTimeLine, {
        //取得綁定物件函數清單
        getEvtBindList: function(){
            let i = this,
                jSupmntList = {//附帶清單
                    isPaused: false,
                    isSetClass_esFloat: false,
                };
            
            function jTem( evt ){
                switch( evt.type ){
                    case 'mouseenter':
                        jz.wCode.evtBind( this, 'add', {
                            mousemove: jTem_hover,
                        } );
                        break;
                    case 'mousedown':
                        jz.wCode.evtBind( document, 'add', {
                            mousemove: jTem,
                            mouseup: jTem,
                        } );
                        break;
                    case 'mouseup':
                        jz.wCode.evtBind( document, 'remove', {
                            mousemove: jTem,
                            mouseup: jTem,
                        } );
                        break;
                    case 'mouseleave':
                        jz.wCode.evtBind( this, 'remove', {
                            mousemove: jTem_hover,
                        } );
                        break;
                }
                
                jSupmntList.isHoverState = false;
                i.evtBineFunc( evt, jSupmntList );
            }
            
            function jTem_hover( evt ){
                jSupmntList.isHoverState = true;
                i.evtBineFunc( evt, jSupmntList );
            }
            
            return {
                mouseenter: jTem,
                mousedown: jTem,
                mouseleave: jTem,
            };
        },
        //取得參數
        getStandardInf: function( jCurrent ){
            let i = this,
                isLive = i._hide_isLive,
                jInf = {
                    isLive: isLive,
                    HElem_progress: i.HElem_progress,
                    HElem_floatShow: i.HElem_floatShow,
                    HElem_buffer: i.HElem_buffer,
                    HElem_play: i.HElem_play,
                    time: jCurrent || i.current(),
                };
            
            if( isLive ){
                jInf.timeFromEnd = i.liveDuration('end') - jInf.time;
                if( jInf.timeFromEnd < 0 ) jInf.timeFromEnd = 0;
                jInf.timeArr = i.getTimeString( jInf.timeFromEnd );
                jInf.placePercent = i.getPlacePercent_live( jInf.time );
            }else{
                jInf.timeArr = i.getTimeString( jInf.time );
                jInf.placePercent = i.getPlacePercent_vod( jInf.time );
            }
            
            jInf.timeStr = jInf.timeArr.join(':');
            
            return jInf;
        },
        getEvtStandardInf: function( evt ){
            let i = this,
                isLive = i._hide_isLive,
                jPlacePercent = jz.prop.mouseOverPlacePercent( 'horizontal', evt, i.HElem_progress ),
                jCurrentTime = i.duration() * jPlacePercent + ( isLive ? i.duration('start') : 0 ),
                jInf = i.getStandardInf( jCurrentTime );
            
            return jInf;
        },
        //設定影片類型
        setVideoType: function( isLive ){
            let i = this;
            
            if( isLive ){
                i.addClass('esLive');
                
                i.HElem_buffer.style.width = null;
                
                if( i._hide_isLivePlayback ){
                    i.duration = i.liveDuration;
                    i.current = i.liveCurrent;
                }else{
                    i.duration = i.current = null;
                }
            }else{
                i.removeClass('esLive');
                i.HElem_buffer.style.width = '0';
                i.duration = i.vodDuration;
                i.current = i.vodCurrent;
            }
        },
        //設定顯示畫面
        setBufferShow_vod: function(){
            let i = this;
            
            i.animFPS( 'buffer', function(){
                if( !i._hide_isVideoReady ) return;
                
                let isCumulativeBuffer = i._hide_isCumulativeBuffer,
                    jBufferPercentList = i._hide_bufferPercentList,
                    jBufferTime = i.vodBuffer() * 100 || 0,
                    isShowChange = false,
                    NumPercent = jBufferPercentList.timeCurrent + jBufferTime;
                
                if( NumPercent > 100 ) NumPercent = 100;
                
                if( isCumulativeBuffer ){
                    if( NumPercent > jBufferPercentList.already ){
                        isShowChange = true;
                        jBufferPercentList.already = NumPercent;
                    }
                }else{
                    isShowChange = true;
                }
                
                if( isShowChange )
                    i.HElem_buffer.style.width = NumPercent + '%';
            } );
        },
        setTimeLineShow: function( jInf ){
            let i = this;
            
            i.animFPS( 'timeLine', function(){
                if( !i._hide_isVideoReady ) return;
                
                switch( jInf.state ){
                    case 'hover':
                        i.setTimeLineShow_hover( jInf );
                        break;
                    case 'preview':
                        i.setTimeLineShow_hover( jInf );
                        i.setTimeLineShow_timeUpdate( jInf );
                        break;
                    case 'timeUpdate':
                        i._hide_bufferPercentList.timeCurrent = jInf.placePercent;
                        i.setTimeLineShow_timeUpdate( jInf );
                        break;
                }
            } );
        },
        setTimeLineShow_hover: function( jInf ){
            let HElem_floatShow = jInf.HElem_floatShow;
            HElem_floatShow.innerText = jInf.timeStr;
            HElem_floatShow.style.left = jInf.placePercent + '%';
        },
        setTimeLineShow_timeUpdate: function( jInf ){
            let HElem_play = jInf.HElem_play;
            HElem_play.setAttribute( 'data-playtime', jInf.timeStr );
            HElem_play.style.width = jInf.placePercent + '%';
        },
        //撥放過濾器
        playActFilter: function( jInf, jTimeMS ){
            let i = this;
            i.actFilter( 'play', function(){
                i._hide_bufferPercentList.timeCurrent = jInf.placePercent;
                if( i._hide_isLive )
                    i.current( jInf.time, jInf.timeFromEnd );
                else
                    i.current( jInf.time );
                
            }, ( jTimeMS || i._hide_lazyPlayTime ) );
        },
        //取得當前撥放時間百分比
        getPlacePercent: function( jDividend, jDivisor ){
            let Ans;
            
            if( jDividend === 0 || jDivisor === 0 ) Ans = 0;
            else{
                Ans = jDividend / jDivisor * 100;
                Ans = ( Ans < 100 )? parseFloat( Ans.toFixed(2) ) : 100;
            }
            
            return Ans;
        },
        getPlacePercent_vod: function( jCurrent ){
            let i = this,
                Ans = i.getPlacePercent( ( jCurrent || i.current() ), i.duration() );
            
            return Ans;
        },
        getPlacePercent_live: function( jCurrent ){
            let i = this;
            
            jCurrent = ( jCurrent || i.current() ) - i.duration('start');
            
            return i.getPlacePercent( jCurrent, i.duration() );
        },
        //取得時間以秒數換算的時分秒進位
        getTimeString: function( NumA ){
            let i = this,
                Ans = [],
                jDuration = i.duration();
            NumA = ( typeof NumA === 'number' )? NumA : jDuration;
            
            Ans = i.getTimeString_carry( Math.round( NumA ) );
            if( jDuration >= 3600 )
                Array.prototype.unshift.apply( Ans, i.getTimeString_carry( Ans.shift() ) );
            
            return Ans;
        },
        getTimeString_carry: function( NumA ){
            let nRemainder = NumA % 60,
                nCarry = ( NumA - nRemainder ) / 60;
            
            return [
                this.getTimeString_twoNum( nCarry ),
                this.getTimeString_twoNum( nRemainder )
            ];
        },
        getTimeString_twoNum: function( NumA ){
            return (( NumA < 10 )? '0' : '' ) + NumA;
        },
    } );