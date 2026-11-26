// node_modules/embla-carousel/esm/embla-carousel.esm.js
function isNumber(subject) {
  return typeof subject === "number";
}
function isString(subject) {
  return typeof subject === "string";
}
function isBoolean(subject) {
  return typeof subject === "boolean";
}
function isObject(subject) {
  return Object.prototype.toString.call(subject) === "[object Object]";
}
function mathAbs(n) {
  return Math.abs(n);
}
function mathSign(n) {
  return Math.sign(n);
}
function deltaAbs(valueB, valueA) {
  return mathAbs(valueB - valueA);
}
function factorAbs(valueB, valueA) {
  if (valueB === 0 || valueA === 0)
    return 0;
  if (mathAbs(valueB) <= mathAbs(valueA))
    return 0;
  const diff = deltaAbs(mathAbs(valueB), mathAbs(valueA));
  return mathAbs(diff / valueB);
}
function roundToTwoDecimals(num) {
  return Math.round(num * 100) / 100;
}
function arrayKeys(array) {
  return objectKeys(array).map(Number);
}
function arrayLast(array) {
  return array[arrayLastIndex(array)];
}
function arrayLastIndex(array) {
  return Math.max(0, array.length - 1);
}
function arrayIsLastIndex(array, index) {
  return index === arrayLastIndex(array);
}
function arrayFromNumber(n, startAt = 0) {
  return Array.from(Array(n), (_, i) => startAt + i);
}
function objectKeys(object) {
  return Object.keys(object);
}
function objectsMergeDeep(objectA, objectB) {
  return [objectA, objectB].reduce((mergedObjects, currentObject) => {
    objectKeys(currentObject).forEach((key) => {
      const valueA = mergedObjects[key];
      const valueB = currentObject[key];
      const areObjects = isObject(valueA) && isObject(valueB);
      mergedObjects[key] = areObjects ? objectsMergeDeep(valueA, valueB) : valueB;
    });
    return mergedObjects;
  }, {});
}
function isMouseEvent(evt, ownerWindow) {
  return typeof ownerWindow.MouseEvent !== "undefined" && evt instanceof ownerWindow.MouseEvent;
}
function Alignment(align, viewSize) {
  const predefined = {
    start,
    center,
    end
  };
  function start() {
    return 0;
  }
  function center(n) {
    return end(n) / 2;
  }
  function end(n) {
    return viewSize - n;
  }
  function measure(n, index) {
    if (isString(align))
      return predefined[align](n);
    return align(viewSize, n, index);
  }
  const self = {
    measure
  };
  return self;
}
function EventStore() {
  let listeners = [];
  function add(node, type, handler, options = {
    passive: true
  }) {
    let removeListener;
    if ("addEventListener" in node) {
      node.addEventListener(type, handler, options);
      removeListener = () => node.removeEventListener(type, handler, options);
    } else {
      const legacyMediaQueryList = node;
      legacyMediaQueryList.addListener(handler);
      removeListener = () => legacyMediaQueryList.removeListener(handler);
    }
    listeners.push(removeListener);
    return self;
  }
  function clear() {
    listeners = listeners.filter((remove) => remove());
  }
  const self = {
    add,
    clear
  };
  return self;
}
function Animations(ownerDocument, ownerWindow, update, render) {
  const documentVisibleHandler = EventStore();
  const fixedTimeStep = 1000 / 60;
  let lastTimeStamp = null;
  let accumulatedTime = 0;
  let animationId = 0;
  function init() {
    documentVisibleHandler.add(ownerDocument, "visibilitychange", () => {
      if (ownerDocument.hidden)
        reset();
    });
  }
  function destroy() {
    stop();
    documentVisibleHandler.clear();
  }
  function animate(timeStamp) {
    if (!animationId)
      return;
    if (!lastTimeStamp) {
      lastTimeStamp = timeStamp;
      update();
      update();
    }
    const timeElapsed = timeStamp - lastTimeStamp;
    lastTimeStamp = timeStamp;
    accumulatedTime += timeElapsed;
    while (accumulatedTime >= fixedTimeStep) {
      update();
      accumulatedTime -= fixedTimeStep;
    }
    const alpha = accumulatedTime / fixedTimeStep;
    render(alpha);
    if (animationId) {
      animationId = ownerWindow.requestAnimationFrame(animate);
    }
  }
  function start() {
    if (animationId)
      return;
    animationId = ownerWindow.requestAnimationFrame(animate);
  }
  function stop() {
    ownerWindow.cancelAnimationFrame(animationId);
    lastTimeStamp = null;
    accumulatedTime = 0;
    animationId = 0;
  }
  function reset() {
    lastTimeStamp = null;
    accumulatedTime = 0;
  }
  const self = {
    init,
    destroy,
    start,
    stop,
    update,
    render
  };
  return self;
}
function Axis(axis, contentDirection) {
  const isRightToLeft = contentDirection === "rtl";
  const isVertical = axis === "y";
  const scroll = isVertical ? "y" : "x";
  const cross = isVertical ? "x" : "y";
  const sign = !isVertical && isRightToLeft ? -1 : 1;
  const startEdge = getStartEdge();
  const endEdge = getEndEdge();
  function measureSize(nodeRect) {
    const {
      height,
      width
    } = nodeRect;
    return isVertical ? height : width;
  }
  function getStartEdge() {
    if (isVertical)
      return "top";
    return isRightToLeft ? "right" : "left";
  }
  function getEndEdge() {
    if (isVertical)
      return "bottom";
    return isRightToLeft ? "left" : "right";
  }
  function direction(n) {
    return n * sign;
  }
  const self = {
    scroll,
    cross,
    startEdge,
    endEdge,
    measureSize,
    direction
  };
  return self;
}
function Limit(min = 0, max = 0) {
  const length = mathAbs(min - max);
  function reachedMin(n) {
    return n < min;
  }
  function reachedMax(n) {
    return n > max;
  }
  function reachedAny(n) {
    return reachedMin(n) || reachedMax(n);
  }
  function constrain(n) {
    if (!reachedAny(n))
      return n;
    return reachedMin(n) ? min : max;
  }
  function removeOffset(n) {
    if (!length)
      return n;
    return n - length * Math.ceil((n - max) / length);
  }
  const self = {
    length,
    max,
    min,
    constrain,
    reachedAny,
    reachedMax,
    reachedMin,
    removeOffset
  };
  return self;
}
function Counter(max, start, loop) {
  const {
    constrain
  } = Limit(0, max);
  const loopEnd = max + 1;
  let counter = withinLimit(start);
  function withinLimit(n) {
    return !loop ? constrain(n) : mathAbs((loopEnd + n) % loopEnd);
  }
  function get() {
    return counter;
  }
  function set(n) {
    counter = withinLimit(n);
    return self;
  }
  function add(n) {
    return clone().set(get() + n);
  }
  function clone() {
    return Counter(max, get(), loop);
  }
  const self = {
    get,
    set,
    add,
    clone
  };
  return self;
}
function DragHandler(axis, rootNode, ownerDocument, ownerWindow, target, dragTracker, location, animation, scrollTo, scrollBody, scrollTarget, index, eventHandler, percentOfView, dragFree, dragThreshold, skipSnaps, baseFriction, watchDrag) {
  const {
    cross: crossAxis,
    direction
  } = axis;
  const focusNodes = ["INPUT", "SELECT", "TEXTAREA"];
  const nonPassiveEvent = {
    passive: false
  };
  const initEvents = EventStore();
  const dragEvents = EventStore();
  const goToNextThreshold = Limit(50, 225).constrain(percentOfView.measure(20));
  const snapForceBoost = {
    mouse: 300,
    touch: 400
  };
  const freeForceBoost = {
    mouse: 500,
    touch: 600
  };
  const baseSpeed = dragFree ? 43 : 25;
  let isMoving = false;
  let startScroll = 0;
  let startCross = 0;
  let pointerIsDown = false;
  let preventScroll = false;
  let preventClick = false;
  let isMouse = false;
  function init(emblaApi) {
    if (!watchDrag)
      return;
    function downIfAllowed(evt) {
      if (isBoolean(watchDrag) || watchDrag(emblaApi, evt))
        down(evt);
    }
    const node = rootNode;
    initEvents.add(node, "dragstart", (evt) => evt.preventDefault(), nonPassiveEvent).add(node, "touchmove", () => {
      return;
    }, nonPassiveEvent).add(node, "touchend", () => {
      return;
    }).add(node, "touchstart", downIfAllowed).add(node, "mousedown", downIfAllowed).add(node, "touchcancel", up).add(node, "contextmenu", up).add(node, "click", click, true);
  }
  function destroy() {
    initEvents.clear();
    dragEvents.clear();
  }
  function addDragEvents() {
    const node = isMouse ? ownerDocument : rootNode;
    dragEvents.add(node, "touchmove", move, nonPassiveEvent).add(node, "touchend", up).add(node, "mousemove", move, nonPassiveEvent).add(node, "mouseup", up);
  }
  function isFocusNode(node) {
    const nodeName = node.nodeName || "";
    return focusNodes.includes(nodeName);
  }
  function forceBoost() {
    const boost = dragFree ? freeForceBoost : snapForceBoost;
    const type = isMouse ? "mouse" : "touch";
    return boost[type];
  }
  function allowedForce(force, targetChanged) {
    const next = index.add(mathSign(force) * -1);
    const baseForce = scrollTarget.byDistance(force, !dragFree).distance;
    if (dragFree || mathAbs(force) < goToNextThreshold)
      return baseForce;
    if (skipSnaps && targetChanged)
      return baseForce * 0.5;
    return scrollTarget.byIndex(next.get(), 0).distance;
  }
  function down(evt) {
    const isMouseEvt = isMouseEvent(evt, ownerWindow);
    isMouse = isMouseEvt;
    preventClick = dragFree && isMouseEvt && !evt.buttons && isMoving;
    isMoving = deltaAbs(target.get(), location.get()) >= 2;
    if (isMouseEvt && evt.button !== 0)
      return;
    if (isFocusNode(evt.target))
      return;
    pointerIsDown = true;
    dragTracker.pointerDown(evt);
    scrollBody.useFriction(0).useDuration(0);
    target.set(location);
    addDragEvents();
    startScroll = dragTracker.readPoint(evt);
    startCross = dragTracker.readPoint(evt, crossAxis);
    eventHandler.emit("pointerDown");
  }
  function move(evt) {
    const isTouchEvt = !isMouseEvent(evt, ownerWindow);
    if (isTouchEvt && evt.touches.length >= 2)
      return up(evt);
    const lastScroll = dragTracker.readPoint(evt);
    const lastCross = dragTracker.readPoint(evt, crossAxis);
    const diffScroll = deltaAbs(lastScroll, startScroll);
    const diffCross = deltaAbs(lastCross, startCross);
    if (!preventScroll && !isMouse) {
      if (!evt.cancelable)
        return up(evt);
      preventScroll = diffScroll > diffCross;
      if (!preventScroll)
        return up(evt);
    }
    const diff = dragTracker.pointerMove(evt);
    if (diffScroll > dragThreshold)
      preventClick = true;
    scrollBody.useFriction(0.3).useDuration(0.75);
    animation.start();
    target.add(direction(diff));
    evt.preventDefault();
  }
  function up(evt) {
    const currentLocation = scrollTarget.byDistance(0, false);
    const targetChanged = currentLocation.index !== index.get();
    const rawForce = dragTracker.pointerUp(evt) * forceBoost();
    const force = allowedForce(direction(rawForce), targetChanged);
    const forceFactor = factorAbs(rawForce, force);
    const speed = baseSpeed - 10 * forceFactor;
    const friction = baseFriction + forceFactor / 50;
    preventScroll = false;
    pointerIsDown = false;
    dragEvents.clear();
    scrollBody.useDuration(speed).useFriction(friction);
    scrollTo.distance(force, !dragFree);
    isMouse = false;
    eventHandler.emit("pointerUp");
  }
  function click(evt) {
    if (preventClick) {
      evt.stopPropagation();
      evt.preventDefault();
      preventClick = false;
    }
  }
  function pointerDown() {
    return pointerIsDown;
  }
  const self = {
    init,
    destroy,
    pointerDown
  };
  return self;
}
function DragTracker(axis, ownerWindow) {
  const logInterval = 170;
  let startEvent;
  let lastEvent;
  function readTime(evt) {
    return evt.timeStamp;
  }
  function readPoint(evt, evtAxis) {
    const property = evtAxis || axis.scroll;
    const coord = `client${property === "x" ? "X" : "Y"}`;
    return (isMouseEvent(evt, ownerWindow) ? evt : evt.touches[0])[coord];
  }
  function pointerDown(evt) {
    startEvent = evt;
    lastEvent = evt;
    return readPoint(evt);
  }
  function pointerMove(evt) {
    const diff = readPoint(evt) - readPoint(lastEvent);
    const expired = readTime(evt) - readTime(startEvent) > logInterval;
    lastEvent = evt;
    if (expired)
      startEvent = evt;
    return diff;
  }
  function pointerUp(evt) {
    if (!startEvent || !lastEvent)
      return 0;
    const diffDrag = readPoint(lastEvent) - readPoint(startEvent);
    const diffTime = readTime(evt) - readTime(startEvent);
    const expired = readTime(evt) - readTime(lastEvent) > logInterval;
    const force = diffDrag / diffTime;
    const isFlick = diffTime && !expired && mathAbs(force) > 0.1;
    return isFlick ? force : 0;
  }
  const self = {
    pointerDown,
    pointerMove,
    pointerUp,
    readPoint
  };
  return self;
}
function NodeRects() {
  function measure(node) {
    const {
      offsetTop,
      offsetLeft,
      offsetWidth,
      offsetHeight
    } = node;
    const offset = {
      top: offsetTop,
      right: offsetLeft + offsetWidth,
      bottom: offsetTop + offsetHeight,
      left: offsetLeft,
      width: offsetWidth,
      height: offsetHeight
    };
    return offset;
  }
  const self = {
    measure
  };
  return self;
}
function PercentOfView(viewSize) {
  function measure(n) {
    return viewSize * (n / 100);
  }
  const self = {
    measure
  };
  return self;
}
function ResizeHandler(container, eventHandler, ownerWindow, slides, axis, watchResize, nodeRects) {
  const observeNodes = [container].concat(slides);
  let resizeObserver;
  let containerSize;
  let slideSizes = [];
  let destroyed = false;
  function readSize(node) {
    return axis.measureSize(nodeRects.measure(node));
  }
  function init(emblaApi) {
    if (!watchResize)
      return;
    containerSize = readSize(container);
    slideSizes = slides.map(readSize);
    function defaultCallback(entries) {
      for (const entry of entries) {
        if (destroyed)
          return;
        const isContainer = entry.target === container;
        const slideIndex = slides.indexOf(entry.target);
        const lastSize = isContainer ? containerSize : slideSizes[slideIndex];
        const newSize = readSize(isContainer ? container : slides[slideIndex]);
        const diffSize = mathAbs(newSize - lastSize);
        if (diffSize >= 0.5) {
          emblaApi.reInit();
          eventHandler.emit("resize");
          break;
        }
      }
    }
    resizeObserver = new ResizeObserver((entries) => {
      if (isBoolean(watchResize) || watchResize(emblaApi, entries)) {
        defaultCallback(entries);
      }
    });
    ownerWindow.requestAnimationFrame(() => {
      observeNodes.forEach((node) => resizeObserver.observe(node));
    });
  }
  function destroy() {
    destroyed = true;
    if (resizeObserver)
      resizeObserver.disconnect();
  }
  const self = {
    init,
    destroy
  };
  return self;
}
function ScrollBody(location, offsetLocation, previousLocation, target, baseDuration, baseFriction) {
  let scrollVelocity = 0;
  let scrollDirection = 0;
  let scrollDuration = baseDuration;
  let scrollFriction = baseFriction;
  let rawLocation = location.get();
  let rawLocationPrevious = 0;
  function seek() {
    const displacement = target.get() - location.get();
    const isInstant = !scrollDuration;
    let scrollDistance = 0;
    if (isInstant) {
      scrollVelocity = 0;
      previousLocation.set(target);
      location.set(target);
      scrollDistance = displacement;
    } else {
      previousLocation.set(location);
      scrollVelocity += displacement / scrollDuration;
      scrollVelocity *= scrollFriction;
      rawLocation += scrollVelocity;
      location.add(scrollVelocity);
      scrollDistance = rawLocation - rawLocationPrevious;
    }
    scrollDirection = mathSign(scrollDistance);
    rawLocationPrevious = rawLocation;
    return self;
  }
  function settled() {
    const diff = target.get() - offsetLocation.get();
    return mathAbs(diff) < 0.001;
  }
  function duration() {
    return scrollDuration;
  }
  function direction() {
    return scrollDirection;
  }
  function velocity() {
    return scrollVelocity;
  }
  function useBaseDuration() {
    return useDuration(baseDuration);
  }
  function useBaseFriction() {
    return useFriction(baseFriction);
  }
  function useDuration(n) {
    scrollDuration = n;
    return self;
  }
  function useFriction(n) {
    scrollFriction = n;
    return self;
  }
  const self = {
    direction,
    duration,
    velocity,
    seek,
    settled,
    useBaseFriction,
    useBaseDuration,
    useFriction,
    useDuration
  };
  return self;
}
function ScrollBounds(limit, location, target, scrollBody, percentOfView) {
  const pullBackThreshold = percentOfView.measure(10);
  const edgeOffsetTolerance = percentOfView.measure(50);
  const frictionLimit = Limit(0.1, 0.99);
  let disabled = false;
  function shouldConstrain() {
    if (disabled)
      return false;
    if (!limit.reachedAny(target.get()))
      return false;
    if (!limit.reachedAny(location.get()))
      return false;
    return true;
  }
  function constrain(pointerDown) {
    if (!shouldConstrain())
      return;
    const edge = limit.reachedMin(location.get()) ? "min" : "max";
    const diffToEdge = mathAbs(limit[edge] - location.get());
    const diffToTarget = target.get() - location.get();
    const friction = frictionLimit.constrain(diffToEdge / edgeOffsetTolerance);
    target.subtract(diffToTarget * friction);
    if (!pointerDown && mathAbs(diffToTarget) < pullBackThreshold) {
      target.set(limit.constrain(target.get()));
      scrollBody.useDuration(25).useBaseFriction();
    }
  }
  function toggleActive(active) {
    disabled = !active;
  }
  const self = {
    shouldConstrain,
    constrain,
    toggleActive
  };
  return self;
}
function ScrollContain(viewSize, contentSize, snapsAligned, containScroll, pixelTolerance) {
  const scrollBounds = Limit(-contentSize + viewSize, 0);
  const snapsBounded = measureBounded();
  const scrollContainLimit = findScrollContainLimit();
  const snapsContained = measureContained();
  function usePixelTolerance(bound, snap) {
    return deltaAbs(bound, snap) <= 1;
  }
  function findScrollContainLimit() {
    const startSnap = snapsBounded[0];
    const endSnap = arrayLast(snapsBounded);
    const min = snapsBounded.lastIndexOf(startSnap);
    const max = snapsBounded.indexOf(endSnap) + 1;
    return Limit(min, max);
  }
  function measureBounded() {
    return snapsAligned.map((snapAligned, index) => {
      const {
        min,
        max
      } = scrollBounds;
      const snap = scrollBounds.constrain(snapAligned);
      const isFirst = !index;
      const isLast = arrayIsLastIndex(snapsAligned, index);
      if (isFirst)
        return max;
      if (isLast)
        return min;
      if (usePixelTolerance(min, snap))
        return min;
      if (usePixelTolerance(max, snap))
        return max;
      return snap;
    }).map((scrollBound) => parseFloat(scrollBound.toFixed(3)));
  }
  function measureContained() {
    if (contentSize <= viewSize + pixelTolerance)
      return [scrollBounds.max];
    if (containScroll === "keepSnaps")
      return snapsBounded;
    const {
      min,
      max
    } = scrollContainLimit;
    return snapsBounded.slice(min, max);
  }
  const self = {
    snapsContained,
    scrollContainLimit
  };
  return self;
}
function ScrollLimit(contentSize, scrollSnaps, loop) {
  const max = scrollSnaps[0];
  const min = loop ? max - contentSize : arrayLast(scrollSnaps);
  const limit = Limit(min, max);
  const self = {
    limit
  };
  return self;
}
function ScrollLooper(contentSize, limit, location, vectors) {
  const jointSafety = 0.1;
  const min = limit.min + jointSafety;
  const max = limit.max + jointSafety;
  const {
    reachedMin,
    reachedMax
  } = Limit(min, max);
  function shouldLoop(direction) {
    if (direction === 1)
      return reachedMax(location.get());
    if (direction === -1)
      return reachedMin(location.get());
    return false;
  }
  function loop(direction) {
    if (!shouldLoop(direction))
      return;
    const loopDistance = contentSize * (direction * -1);
    vectors.forEach((v) => v.add(loopDistance));
  }
  const self = {
    loop
  };
  return self;
}
function ScrollProgress(limit) {
  const {
    max,
    length
  } = limit;
  function get(n) {
    const currentLocation = n - max;
    return length ? currentLocation / -length : 0;
  }
  const self = {
    get
  };
  return self;
}
function ScrollSnaps(axis, alignment, containerRect, slideRects, slidesToScroll) {
  const {
    startEdge,
    endEdge
  } = axis;
  const {
    groupSlides
  } = slidesToScroll;
  const alignments = measureSizes().map(alignment.measure);
  const snaps = measureUnaligned();
  const snapsAligned = measureAligned();
  function measureSizes() {
    return groupSlides(slideRects).map((rects) => arrayLast(rects)[endEdge] - rects[0][startEdge]).map(mathAbs);
  }
  function measureUnaligned() {
    return slideRects.map((rect) => containerRect[startEdge] - rect[startEdge]).map((snap) => -mathAbs(snap));
  }
  function measureAligned() {
    return groupSlides(snaps).map((g) => g[0]).map((snap, index) => snap + alignments[index]);
  }
  const self = {
    snaps,
    snapsAligned
  };
  return self;
}
function SlideRegistry(containSnaps, containScroll, scrollSnaps, scrollContainLimit, slidesToScroll, slideIndexes) {
  const {
    groupSlides
  } = slidesToScroll;
  const {
    min,
    max
  } = scrollContainLimit;
  const slideRegistry = createSlideRegistry();
  function createSlideRegistry() {
    const groupedSlideIndexes = groupSlides(slideIndexes);
    const doNotContain = !containSnaps || containScroll === "keepSnaps";
    if (scrollSnaps.length === 1)
      return [slideIndexes];
    if (doNotContain)
      return groupedSlideIndexes;
    return groupedSlideIndexes.slice(min, max).map((group, index, groups) => {
      const isFirst = !index;
      const isLast = arrayIsLastIndex(groups, index);
      if (isFirst) {
        const range = arrayLast(groups[0]) + 1;
        return arrayFromNumber(range);
      }
      if (isLast) {
        const range = arrayLastIndex(slideIndexes) - arrayLast(groups)[0] + 1;
        return arrayFromNumber(range, arrayLast(groups)[0]);
      }
      return group;
    });
  }
  const self = {
    slideRegistry
  };
  return self;
}
function ScrollTarget(loop, scrollSnaps, contentSize, limit, targetVector) {
  const {
    reachedAny,
    removeOffset,
    constrain
  } = limit;
  function minDistance(distances) {
    return distances.concat().sort((a, b) => mathAbs(a) - mathAbs(b))[0];
  }
  function findTargetSnap(target) {
    const distance = loop ? removeOffset(target) : constrain(target);
    const ascDiffsToSnaps = scrollSnaps.map((snap, index) => ({
      diff: shortcut(snap - distance, 0),
      index
    })).sort((d1, d2) => mathAbs(d1.diff) - mathAbs(d2.diff));
    const {
      index
    } = ascDiffsToSnaps[0];
    return {
      index,
      distance
    };
  }
  function shortcut(target, direction) {
    const targets = [target, target + contentSize, target - contentSize];
    if (!loop)
      return target;
    if (!direction)
      return minDistance(targets);
    const matchingTargets = targets.filter((t) => mathSign(t) === direction);
    if (matchingTargets.length)
      return minDistance(matchingTargets);
    return arrayLast(targets) - contentSize;
  }
  function byIndex(index, direction) {
    const diffToSnap = scrollSnaps[index] - targetVector.get();
    const distance = shortcut(diffToSnap, direction);
    return {
      index,
      distance
    };
  }
  function byDistance(distance, snap) {
    const target = targetVector.get() + distance;
    const {
      index,
      distance: targetSnapDistance
    } = findTargetSnap(target);
    const reachedBound = !loop && reachedAny(target);
    if (!snap || reachedBound)
      return {
        index,
        distance
      };
    const diffToSnap = scrollSnaps[index] - targetSnapDistance;
    const snapDistance = distance + shortcut(diffToSnap, 0);
    return {
      index,
      distance: snapDistance
    };
  }
  const self = {
    byDistance,
    byIndex,
    shortcut
  };
  return self;
}
function ScrollTo(animation, indexCurrent, indexPrevious, scrollBody, scrollTarget, targetVector, eventHandler) {
  function scrollTo(target) {
    const distanceDiff = target.distance;
    const indexDiff = target.index !== indexCurrent.get();
    targetVector.add(distanceDiff);
    if (distanceDiff) {
      if (scrollBody.duration()) {
        animation.start();
      } else {
        animation.update();
        animation.render(1);
        animation.update();
      }
    }
    if (indexDiff) {
      indexPrevious.set(indexCurrent.get());
      indexCurrent.set(target.index);
      eventHandler.emit("select");
    }
  }
  function distance(n, snap) {
    const target = scrollTarget.byDistance(n, snap);
    scrollTo(target);
  }
  function index(n, direction) {
    const targetIndex = indexCurrent.clone().set(n);
    const target = scrollTarget.byIndex(targetIndex.get(), direction);
    scrollTo(target);
  }
  const self = {
    distance,
    index
  };
  return self;
}
function SlideFocus(root, slides, slideRegistry, scrollTo, scrollBody, eventStore, eventHandler, watchFocus) {
  const focusListenerOptions = {
    passive: true,
    capture: true
  };
  let lastTabPressTime = 0;
  function init(emblaApi) {
    if (!watchFocus)
      return;
    function defaultCallback(index) {
      const nowTime = new Date().getTime();
      const diffTime = nowTime - lastTabPressTime;
      if (diffTime > 10)
        return;
      eventHandler.emit("slideFocusStart");
      root.scrollLeft = 0;
      const group = slideRegistry.findIndex((group) => group.includes(index));
      if (!isNumber(group))
        return;
      scrollBody.useDuration(0);
      scrollTo.index(group, 0);
      eventHandler.emit("slideFocus");
    }
    eventStore.add(document, "keydown", registerTabPress, false);
    slides.forEach((slide, slideIndex) => {
      eventStore.add(slide, "focus", (evt) => {
        if (isBoolean(watchFocus) || watchFocus(emblaApi, evt)) {
          defaultCallback(slideIndex);
        }
      }, focusListenerOptions);
    });
  }
  function registerTabPress(event) {
    if (event.code === "Tab")
      lastTabPressTime = new Date().getTime();
  }
  const self = {
    init
  };
  return self;
}
function Vector1D(initialValue) {
  let value = initialValue;
  function get() {
    return value;
  }
  function set(n) {
    value = normalizeInput(n);
  }
  function add(n) {
    value += normalizeInput(n);
  }
  function subtract(n) {
    value -= normalizeInput(n);
  }
  function normalizeInput(n) {
    return isNumber(n) ? n : n.get();
  }
  const self = {
    get,
    set,
    add,
    subtract
  };
  return self;
}
function Translate(axis, container) {
  const translate = axis.scroll === "x" ? x : y;
  const containerStyle = container.style;
  let previousTarget = null;
  let disabled = false;
  function x(n) {
    return `translate3d(${n}px,0px,0px)`;
  }
  function y(n) {
    return `translate3d(0px,${n}px,0px)`;
  }
  function to(target) {
    if (disabled)
      return;
    const newTarget = roundToTwoDecimals(axis.direction(target));
    if (newTarget === previousTarget)
      return;
    containerStyle.transform = translate(newTarget);
    previousTarget = newTarget;
  }
  function toggleActive(active) {
    disabled = !active;
  }
  function clear() {
    if (disabled)
      return;
    containerStyle.transform = "";
    if (!container.getAttribute("style"))
      container.removeAttribute("style");
  }
  const self = {
    clear,
    to,
    toggleActive
  };
  return self;
}
function SlideLooper(axis, viewSize, contentSize, slideSizes, slideSizesWithGaps, snaps, scrollSnaps, location, slides) {
  const roundingSafety = 0.5;
  const ascItems = arrayKeys(slideSizesWithGaps);
  const descItems = arrayKeys(slideSizesWithGaps).reverse();
  const loopPoints = startPoints().concat(endPoints());
  function removeSlideSizes(indexes, from) {
    return indexes.reduce((a, i) => {
      return a - slideSizesWithGaps[i];
    }, from);
  }
  function slidesInGap(indexes, gap) {
    return indexes.reduce((a, i) => {
      const remainingGap = removeSlideSizes(a, gap);
      return remainingGap > 0 ? a.concat([i]) : a;
    }, []);
  }
  function findSlideBounds(offset) {
    return snaps.map((snap, index) => ({
      start: snap - slideSizes[index] + roundingSafety + offset,
      end: snap + viewSize - roundingSafety + offset
    }));
  }
  function findLoopPoints(indexes, offset, isEndEdge) {
    const slideBounds = findSlideBounds(offset);
    return indexes.map((index) => {
      const initial = isEndEdge ? 0 : -contentSize;
      const altered = isEndEdge ? contentSize : 0;
      const boundEdge = isEndEdge ? "end" : "start";
      const loopPoint = slideBounds[index][boundEdge];
      return {
        index,
        loopPoint,
        slideLocation: Vector1D(-1),
        translate: Translate(axis, slides[index]),
        target: () => location.get() > loopPoint ? initial : altered
      };
    });
  }
  function startPoints() {
    const gap = scrollSnaps[0];
    const indexes = slidesInGap(descItems, gap);
    return findLoopPoints(indexes, contentSize, false);
  }
  function endPoints() {
    const gap = viewSize - scrollSnaps[0] - 1;
    const indexes = slidesInGap(ascItems, gap);
    return findLoopPoints(indexes, -contentSize, true);
  }
  function canLoop() {
    return loopPoints.every(({
      index
    }) => {
      const otherIndexes = ascItems.filter((i) => i !== index);
      return removeSlideSizes(otherIndexes, viewSize) <= 0.1;
    });
  }
  function loop() {
    loopPoints.forEach((loopPoint) => {
      const {
        target,
        translate,
        slideLocation
      } = loopPoint;
      const shiftLocation = target();
      if (shiftLocation === slideLocation.get())
        return;
      translate.to(shiftLocation);
      slideLocation.set(shiftLocation);
    });
  }
  function clear() {
    loopPoints.forEach((loopPoint) => loopPoint.translate.clear());
  }
  const self = {
    canLoop,
    clear,
    loop,
    loopPoints
  };
  return self;
}
function SlidesHandler(container, eventHandler, watchSlides) {
  let mutationObserver;
  let destroyed = false;
  function init(emblaApi) {
    if (!watchSlides)
      return;
    function defaultCallback(mutations) {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          emblaApi.reInit();
          eventHandler.emit("slidesChanged");
          break;
        }
      }
    }
    mutationObserver = new MutationObserver((mutations) => {
      if (destroyed)
        return;
      if (isBoolean(watchSlides) || watchSlides(emblaApi, mutations)) {
        defaultCallback(mutations);
      }
    });
    mutationObserver.observe(container, {
      childList: true
    });
  }
  function destroy() {
    if (mutationObserver)
      mutationObserver.disconnect();
    destroyed = true;
  }
  const self = {
    init,
    destroy
  };
  return self;
}
function SlidesInView(container, slides, eventHandler, threshold) {
  const intersectionEntryMap = {};
  let inViewCache = null;
  let notInViewCache = null;
  let intersectionObserver;
  let destroyed = false;
  function init() {
    intersectionObserver = new IntersectionObserver((entries) => {
      if (destroyed)
        return;
      entries.forEach((entry) => {
        const index = slides.indexOf(entry.target);
        intersectionEntryMap[index] = entry;
      });
      inViewCache = null;
      notInViewCache = null;
      eventHandler.emit("slidesInView");
    }, {
      root: container.parentElement,
      threshold
    });
    slides.forEach((slide) => intersectionObserver.observe(slide));
  }
  function destroy() {
    if (intersectionObserver)
      intersectionObserver.disconnect();
    destroyed = true;
  }
  function createInViewList(inView) {
    return objectKeys(intersectionEntryMap).reduce((list, slideIndex) => {
      const index = parseInt(slideIndex);
      const {
        isIntersecting
      } = intersectionEntryMap[index];
      const inViewMatch = inView && isIntersecting;
      const notInViewMatch = !inView && !isIntersecting;
      if (inViewMatch || notInViewMatch)
        list.push(index);
      return list;
    }, []);
  }
  function get(inView = true) {
    if (inView && inViewCache)
      return inViewCache;
    if (!inView && notInViewCache)
      return notInViewCache;
    const slideIndexes = createInViewList(inView);
    if (inView)
      inViewCache = slideIndexes;
    if (!inView)
      notInViewCache = slideIndexes;
    return slideIndexes;
  }
  const self = {
    init,
    destroy,
    get
  };
  return self;
}
function SlideSizes(axis, containerRect, slideRects, slides, readEdgeGap, ownerWindow) {
  const {
    measureSize,
    startEdge,
    endEdge
  } = axis;
  const withEdgeGap = slideRects[0] && readEdgeGap;
  const startGap = measureStartGap();
  const endGap = measureEndGap();
  const slideSizes = slideRects.map(measureSize);
  const slideSizesWithGaps = measureWithGaps();
  function measureStartGap() {
    if (!withEdgeGap)
      return 0;
    const slideRect = slideRects[0];
    return mathAbs(containerRect[startEdge] - slideRect[startEdge]);
  }
  function measureEndGap() {
    if (!withEdgeGap)
      return 0;
    const style = ownerWindow.getComputedStyle(arrayLast(slides));
    return parseFloat(style.getPropertyValue(`margin-${endEdge}`));
  }
  function measureWithGaps() {
    return slideRects.map((rect, index, rects) => {
      const isFirst = !index;
      const isLast = arrayIsLastIndex(rects, index);
      if (isFirst)
        return slideSizes[index] + startGap;
      if (isLast)
        return slideSizes[index] + endGap;
      return rects[index + 1][startEdge] - rect[startEdge];
    }).map(mathAbs);
  }
  const self = {
    slideSizes,
    slideSizesWithGaps,
    startGap,
    endGap
  };
  return self;
}
function SlidesToScroll(axis, viewSize, slidesToScroll, loop, containerRect, slideRects, startGap, endGap, pixelTolerance) {
  const {
    startEdge,
    endEdge,
    direction
  } = axis;
  const groupByNumber = isNumber(slidesToScroll);
  function byNumber(array, groupSize) {
    return arrayKeys(array).filter((i) => i % groupSize === 0).map((i) => array.slice(i, i + groupSize));
  }
  function bySize(array) {
    if (!array.length)
      return [];
    return arrayKeys(array).reduce((groups, rectB, index) => {
      const rectA = arrayLast(groups) || 0;
      const isFirst = rectA === 0;
      const isLast = rectB === arrayLastIndex(array);
      const edgeA = containerRect[startEdge] - slideRects[rectA][startEdge];
      const edgeB = containerRect[startEdge] - slideRects[rectB][endEdge];
      const gapA = !loop && isFirst ? direction(startGap) : 0;
      const gapB = !loop && isLast ? direction(endGap) : 0;
      const chunkSize = mathAbs(edgeB - gapB - (edgeA + gapA));
      if (index && chunkSize > viewSize + pixelTolerance)
        groups.push(rectB);
      if (isLast)
        groups.push(array.length);
      return groups;
    }, []).map((currentSize, index, groups) => {
      const previousSize = Math.max(groups[index - 1] || 0);
      return array.slice(previousSize, currentSize);
    });
  }
  function groupSlides(array) {
    return groupByNumber ? byNumber(array, slidesToScroll) : bySize(array);
  }
  const self = {
    groupSlides
  };
  return self;
}
function Engine(root, container, slides, ownerDocument, ownerWindow, options, eventHandler) {
  const {
    align,
    axis: scrollAxis,
    direction,
    startIndex,
    loop,
    duration,
    dragFree,
    dragThreshold,
    inViewThreshold,
    slidesToScroll: groupSlides,
    skipSnaps,
    containScroll,
    watchResize,
    watchSlides,
    watchDrag,
    watchFocus
  } = options;
  const pixelTolerance = 2;
  const nodeRects = NodeRects();
  const containerRect = nodeRects.measure(container);
  const slideRects = slides.map(nodeRects.measure);
  const axis = Axis(scrollAxis, direction);
  const viewSize = axis.measureSize(containerRect);
  const percentOfView = PercentOfView(viewSize);
  const alignment = Alignment(align, viewSize);
  const containSnaps = !loop && !!containScroll;
  const readEdgeGap = loop || !!containScroll;
  const {
    slideSizes,
    slideSizesWithGaps,
    startGap,
    endGap
  } = SlideSizes(axis, containerRect, slideRects, slides, readEdgeGap, ownerWindow);
  const slidesToScroll = SlidesToScroll(axis, viewSize, groupSlides, loop, containerRect, slideRects, startGap, endGap, pixelTolerance);
  const {
    snaps,
    snapsAligned
  } = ScrollSnaps(axis, alignment, containerRect, slideRects, slidesToScroll);
  const contentSize = -arrayLast(snaps) + arrayLast(slideSizesWithGaps);
  const {
    snapsContained,
    scrollContainLimit
  } = ScrollContain(viewSize, contentSize, snapsAligned, containScroll, pixelTolerance);
  const scrollSnaps = containSnaps ? snapsContained : snapsAligned;
  const {
    limit
  } = ScrollLimit(contentSize, scrollSnaps, loop);
  const index = Counter(arrayLastIndex(scrollSnaps), startIndex, loop);
  const indexPrevious = index.clone();
  const slideIndexes = arrayKeys(slides);
  const update = ({
    dragHandler,
    scrollBody,
    scrollBounds,
    options: {
      loop
    }
  }) => {
    if (!loop)
      scrollBounds.constrain(dragHandler.pointerDown());
    scrollBody.seek();
  };
  const render = ({
    scrollBody,
    translate,
    location,
    offsetLocation,
    previousLocation,
    scrollLooper,
    slideLooper,
    dragHandler,
    animation,
    eventHandler,
    scrollBounds,
    options: {
      loop
    }
  }, alpha) => {
    const shouldSettle = scrollBody.settled();
    const withinBounds = !scrollBounds.shouldConstrain();
    const hasSettled = loop ? shouldSettle : shouldSettle && withinBounds;
    const hasSettledAndIdle = hasSettled && !dragHandler.pointerDown();
    if (hasSettledAndIdle)
      animation.stop();
    const interpolatedLocation = location.get() * alpha + previousLocation.get() * (1 - alpha);
    offsetLocation.set(interpolatedLocation);
    if (loop) {
      scrollLooper.loop(scrollBody.direction());
      slideLooper.loop();
    }
    translate.to(offsetLocation.get());
    if (hasSettledAndIdle)
      eventHandler.emit("settle");
    if (!hasSettled)
      eventHandler.emit("scroll");
  };
  const animation = Animations(ownerDocument, ownerWindow, () => update(engine), (alpha) => render(engine, alpha));
  const friction = 0.68;
  const startLocation = scrollSnaps[index.get()];
  const location = Vector1D(startLocation);
  const previousLocation = Vector1D(startLocation);
  const offsetLocation = Vector1D(startLocation);
  const target = Vector1D(startLocation);
  const scrollBody = ScrollBody(location, offsetLocation, previousLocation, target, duration, friction);
  const scrollTarget = ScrollTarget(loop, scrollSnaps, contentSize, limit, target);
  const scrollTo = ScrollTo(animation, index, indexPrevious, scrollBody, scrollTarget, target, eventHandler);
  const scrollProgress = ScrollProgress(limit);
  const eventStore = EventStore();
  const slidesInView = SlidesInView(container, slides, eventHandler, inViewThreshold);
  const {
    slideRegistry
  } = SlideRegistry(containSnaps, containScroll, scrollSnaps, scrollContainLimit, slidesToScroll, slideIndexes);
  const slideFocus = SlideFocus(root, slides, slideRegistry, scrollTo, scrollBody, eventStore, eventHandler, watchFocus);
  const engine = {
    ownerDocument,
    ownerWindow,
    eventHandler,
    containerRect,
    slideRects,
    animation,
    axis,
    dragHandler: DragHandler(axis, root, ownerDocument, ownerWindow, target, DragTracker(axis, ownerWindow), location, animation, scrollTo, scrollBody, scrollTarget, index, eventHandler, percentOfView, dragFree, dragThreshold, skipSnaps, friction, watchDrag),
    eventStore,
    percentOfView,
    index,
    indexPrevious,
    limit,
    location,
    offsetLocation,
    previousLocation,
    options,
    resizeHandler: ResizeHandler(container, eventHandler, ownerWindow, slides, axis, watchResize, nodeRects),
    scrollBody,
    scrollBounds: ScrollBounds(limit, offsetLocation, target, scrollBody, percentOfView),
    scrollLooper: ScrollLooper(contentSize, limit, offsetLocation, [location, offsetLocation, previousLocation, target]),
    scrollProgress,
    scrollSnapList: scrollSnaps.map(scrollProgress.get),
    scrollSnaps,
    scrollTarget,
    scrollTo,
    slideLooper: SlideLooper(axis, viewSize, contentSize, slideSizes, slideSizesWithGaps, snaps, scrollSnaps, offsetLocation, slides),
    slideFocus,
    slidesHandler: SlidesHandler(container, eventHandler, watchSlides),
    slidesInView,
    slideIndexes,
    slideRegistry,
    slidesToScroll,
    target,
    translate: Translate(axis, container)
  };
  return engine;
}
function EventHandler() {
  let listeners = {};
  let api;
  function init(emblaApi) {
    api = emblaApi;
  }
  function getListeners(evt) {
    return listeners[evt] || [];
  }
  function emit(evt) {
    getListeners(evt).forEach((e) => e(api, evt));
    return self;
  }
  function on(evt, cb) {
    listeners[evt] = getListeners(evt).concat([cb]);
    return self;
  }
  function off(evt, cb) {
    listeners[evt] = getListeners(evt).filter((e) => e !== cb);
    return self;
  }
  function clear() {
    listeners = {};
  }
  const self = {
    init,
    emit,
    off,
    on,
    clear
  };
  return self;
}
var defaultOptions = {
  align: "center",
  axis: "x",
  container: null,
  slides: null,
  containScroll: "trimSnaps",
  direction: "ltr",
  slidesToScroll: 1,
  inViewThreshold: 0,
  breakpoints: {},
  dragFree: false,
  dragThreshold: 10,
  loop: false,
  skipSnaps: false,
  duration: 25,
  startIndex: 0,
  active: true,
  watchDrag: true,
  watchResize: true,
  watchSlides: true,
  watchFocus: true
};
function OptionsHandler(ownerWindow) {
  function mergeOptions(optionsA, optionsB) {
    return objectsMergeDeep(optionsA, optionsB || {});
  }
  function optionsAtMedia(options) {
    const optionsAtMedia = options.breakpoints || {};
    const matchedMediaOptions = objectKeys(optionsAtMedia).filter((media) => ownerWindow.matchMedia(media).matches).map((media) => optionsAtMedia[media]).reduce((a, mediaOption) => mergeOptions(a, mediaOption), {});
    return mergeOptions(options, matchedMediaOptions);
  }
  function optionsMediaQueries(optionsList) {
    return optionsList.map((options) => objectKeys(options.breakpoints || {})).reduce((acc, mediaQueries) => acc.concat(mediaQueries), []).map(ownerWindow.matchMedia);
  }
  const self = {
    mergeOptions,
    optionsAtMedia,
    optionsMediaQueries
  };
  return self;
}
function PluginsHandler(optionsHandler) {
  let activePlugins = [];
  function init(emblaApi, plugins) {
    activePlugins = plugins.filter(({
      options
    }) => optionsHandler.optionsAtMedia(options).active !== false);
    activePlugins.forEach((plugin) => plugin.init(emblaApi, optionsHandler));
    return plugins.reduce((map, plugin) => Object.assign(map, {
      [plugin.name]: plugin
    }), {});
  }
  function destroy() {
    activePlugins = activePlugins.filter((plugin) => plugin.destroy());
  }
  const self = {
    init,
    destroy
  };
  return self;
}
function EmblaCarousel(root, userOptions, userPlugins) {
  const ownerDocument = root.ownerDocument;
  const ownerWindow = ownerDocument.defaultView;
  const optionsHandler = OptionsHandler(ownerWindow);
  const pluginsHandler = PluginsHandler(optionsHandler);
  const mediaHandlers = EventStore();
  const eventHandler = EventHandler();
  const {
    mergeOptions,
    optionsAtMedia,
    optionsMediaQueries
  } = optionsHandler;
  const {
    on,
    off,
    emit
  } = eventHandler;
  const reInit = reActivate;
  let destroyed = false;
  let engine;
  let optionsBase = mergeOptions(defaultOptions, EmblaCarousel.globalOptions);
  let options = mergeOptions(optionsBase);
  let pluginList = [];
  let pluginApis;
  let container;
  let slides;
  function storeElements() {
    const {
      container: userContainer,
      slides: userSlides
    } = options;
    const customContainer = isString(userContainer) ? root.querySelector(userContainer) : userContainer;
    container = customContainer || root.children[0];
    const customSlides = isString(userSlides) ? container.querySelectorAll(userSlides) : userSlides;
    slides = [].slice.call(customSlides || container.children);
  }
  function createEngine(options) {
    const engine = Engine(root, container, slides, ownerDocument, ownerWindow, options, eventHandler);
    if (options.loop && !engine.slideLooper.canLoop()) {
      const optionsWithoutLoop = Object.assign({}, options, {
        loop: false
      });
      return createEngine(optionsWithoutLoop);
    }
    return engine;
  }
  function activate(withOptions, withPlugins) {
    if (destroyed)
      return;
    optionsBase = mergeOptions(optionsBase, withOptions);
    options = optionsAtMedia(optionsBase);
    pluginList = withPlugins || pluginList;
    storeElements();
    engine = createEngine(options);
    optionsMediaQueries([optionsBase, ...pluginList.map(({
      options
    }) => options)]).forEach((query) => mediaHandlers.add(query, "change", reActivate));
    if (!options.active)
      return;
    engine.translate.to(engine.location.get());
    engine.animation.init();
    engine.slidesInView.init();
    engine.slideFocus.init(self);
    engine.eventHandler.init(self);
    engine.resizeHandler.init(self);
    engine.slidesHandler.init(self);
    if (engine.options.loop)
      engine.slideLooper.loop();
    if (container.offsetParent && slides.length)
      engine.dragHandler.init(self);
    pluginApis = pluginsHandler.init(self, pluginList);
  }
  function reActivate(withOptions, withPlugins) {
    const startIndex = selectedScrollSnap();
    deActivate();
    activate(mergeOptions({
      startIndex
    }, withOptions), withPlugins);
    eventHandler.emit("reInit");
  }
  function deActivate() {
    engine.dragHandler.destroy();
    engine.eventStore.clear();
    engine.translate.clear();
    engine.slideLooper.clear();
    engine.resizeHandler.destroy();
    engine.slidesHandler.destroy();
    engine.slidesInView.destroy();
    engine.animation.destroy();
    pluginsHandler.destroy();
    mediaHandlers.clear();
  }
  function destroy() {
    if (destroyed)
      return;
    destroyed = true;
    mediaHandlers.clear();
    deActivate();
    eventHandler.emit("destroy");
    eventHandler.clear();
  }
  function scrollTo(index, jump, direction) {
    if (!options.active || destroyed)
      return;
    engine.scrollBody.useBaseFriction().useDuration(jump === true ? 0 : options.duration);
    engine.scrollTo.index(index, direction || 0);
  }
  function scrollNext(jump) {
    const next = engine.index.add(1).get();
    scrollTo(next, jump, -1);
  }
  function scrollPrev(jump) {
    const prev = engine.index.add(-1).get();
    scrollTo(prev, jump, 1);
  }
  function canScrollNext() {
    const next = engine.index.add(1).get();
    return next !== selectedScrollSnap();
  }
  function canScrollPrev() {
    const prev = engine.index.add(-1).get();
    return prev !== selectedScrollSnap();
  }
  function scrollSnapList() {
    return engine.scrollSnapList;
  }
  function scrollProgress() {
    return engine.scrollProgress.get(engine.offsetLocation.get());
  }
  function selectedScrollSnap() {
    return engine.index.get();
  }
  function previousScrollSnap() {
    return engine.indexPrevious.get();
  }
  function slidesInView() {
    return engine.slidesInView.get();
  }
  function slidesNotInView() {
    return engine.slidesInView.get(false);
  }
  function plugins() {
    return pluginApis;
  }
  function internalEngine() {
    return engine;
  }
  function rootNode() {
    return root;
  }
  function containerNode() {
    return container;
  }
  function slideNodes() {
    return slides;
  }
  const self = {
    canScrollNext,
    canScrollPrev,
    containerNode,
    internalEngine,
    destroy,
    off,
    on,
    emit,
    plugins,
    previousScrollSnap,
    reInit,
    rootNode,
    scrollNext,
    scrollPrev,
    scrollProgress,
    scrollSnapList,
    scrollTo,
    selectedScrollSnap,
    slideNodes,
    slidesInView,
    slidesNotInView
  };
  activate(userOptions, userPlugins);
  setTimeout(() => eventHandler.emit("init"), 0);
  return self;
}
EmblaCarousel.globalOptions = undefined;

// src/lib/site-interactions.ts
// Les styles sont écrits en classes Tailwind. Les états (menu ouvert, modale, défilement...)
// passent par des attributs data-* que Tailwind lit avec les variants data-[...] / group-data-[...].
var ICON = "inline-block font-fa not-italic font-normal leading-none antialiased";
var MOBILE_LINK = "relative block w-full overflow-hidden pl-3.75 pr-5.5 text-[17px] text-surface hover:text-brand transition-all duration-500 outline-none";
var MOBILE_SUBLINK = "relative block w-full overflow-hidden pl-3.75 pr-5.5 text-[17px] text-nav-ink hover:text-brand font-heading font-semibold transition-all duration-500 outline-none";

function buildMobileNav(nav) {
  const mobile = document.createElement("nav");
  mobile.id = "mobile-nav";
  mobile.className = "fixed top-0 bottom-0 z-[998] pt-[18px] bg-banner-overlay -left-[260px] w-[260px] overflow-y-auto transition-all duration-400 group-data-[nav-open]/body:left-0";
  const list = document.createElement("ul");
  list.className = "p-0 m-0 list-none";
  for (const item of nav.querySelector("ul")?.children ?? []) {
    if (item.matches(".gtranslate_wrapper")) {
      const wrapper = document.createElement("div");
      wrapper.className = "gtranslate_wrapper";
      list.append(wrapper);
      continue;
    }
    const li = document.createElement("li");
    const button = item.querySelector("[data-dropbtn]");
    if (button) {
      li.className = "group/dd relative block py-0 pl-3.75 pr-5.5 hover:cursor-pointer data-[open]:block";
      const dropbtn = document.createElement("button");
      dropbtn.type = "button";
      dropbtn.setAttribute("data-dropbtn", "");
      dropbtn.setAttribute("aria-expanded", "false");
      dropbtn.className = "bg-transparent text-surface p-0 border-0 text-[18px] outline-none cursor-pointer";
      dropbtn.textContent = button.textContent.trim();
      const content = document.createElement("div");
      content.className = "hidden relative text-nav-ink min-w-[160px] shadow-dropdown z-[1] transition-all duration-300 ease-in-out group-hover/dd:block group-focus-within/dd:block group-data-[open]/dd:block";
      for (const link of item.querySelectorAll("div a")) {
        const a = document.createElement("a");
        a.href = link.getAttribute("href") || "#";
        a.className = MOBILE_SUBLINK;
        a.textContent = link.textContent.trim();
        content.append(a);
      }
      li.append(dropbtn, content);
    } else {
      li.className = "relative py-2.5";
      const link = item.querySelector("a");
      const a = document.createElement("a");
      a.href = link?.getAttribute("href") || "#";
      a.className = MOBILE_LINK;
      a.textContent = link?.textContent.trim() ?? "";
      if (item.hasAttribute("data-register"))
        li.setAttribute("data-register", "");
      li.append(a);
    }
    list.append(li);
  }
  mobile.append(list);
  return mobile;
}

function setupSite(root) {
  const controller = new AbortController;
  const { signal } = controller;
  const query = (selector) => root.querySelector(selector);
  const header = query("#header");
  const contact = query("#contact");
  const home = Boolean(query("#intro"));
  if (contact && !home)
    contact.hidden = true;
  const nav = query("#nav-menu-container");
  const mobile = nav ? buildMobileNav(nav) : null;
  if (mobile)
    root.append(mobile);
  const toggle = document.createElement("button");
  toggle.id = "mobile-nav-toggle";
  toggle.type = "button";
  toggle.className = "fixed right-0 top-0 z-[999] mt-3.75 mr-3.75 border-0 bg-transparent text-[24px] hidden max-lg:inline transition-all duration-400 outline-none cursor-pointer";
  toggle.setAttribute("aria-label", "Ouvrir le menu");
  toggle.setAttribute("aria-expanded", "false");
  const barsIcon = `<i class="${ICON} text-surface" aria-hidden="true">&#xf0c9;</i>`;
  const timesIcon = `<i class="${ICON} text-surface" aria-hidden="true">&#xf00d;</i>`;
  toggle.innerHTML = barsIcon;
  root.append(toggle);
  const overlay = document.createElement("div");
  overlay.id = "mobile-body-overly";
  overlay.className = "hidden data-[visible]:block fixed top-0 left-0 w-full h-full z-[997] bg-overlay-80";
  root.append(overlay);
  const closeMobile = () => {
    document.body.removeAttribute("data-nav-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML = barsIcon;
    overlay.removeAttribute("data-visible");
  };
  toggle.addEventListener("click", () => {
    if (document.body.hasAttribute("data-nav-open"))
      return closeMobile();
    document.body.setAttribute("data-nav-open", "");
    toggle.setAttribute("aria-expanded", "true");
    toggle.innerHTML = timesIcon;
    overlay.setAttribute("data-visible", "");
  }, { signal });
  overlay.addEventListener("click", closeMobile, { signal });
  const scroll = () => {
    header?.toggleAttribute("data-scrolled", window.scrollY > 100);
    query("[data-back-to-top]")?.toggleAttribute("data-visible", window.scrollY > 100);
  };
  window.addEventListener("scroll", scroll, { signal, passive: true });
  scroll();
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries)
      if (entry.isIntersecting) {
        entry.target.setAttribute("data-revealed", "");
        observer.unobserve(entry.target);
      }
  }, { threshold: 0.01 });
  root.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));
  const carousels = [];
  const timers = [];
  root.querySelectorAll("[data-carousel]").forEach((viewport) => {
    const track = document.createElement("div");
    track.className = "flex touch-pan-y touch-pinch-zoom";
    while (viewport.firstChild)
      track.append(viewport.firstChild);
    viewport.append(track);
    const carousel = EmblaCarousel(viewport, { loop: true, align: "center" });
    carousels.push(carousel);
    const dots = document.createElement("div");
    dots.className = "text-center mt-6.25";
    const update = () => dots.querySelectorAll("button").forEach((dot, index) => dot.toggleAttribute("data-active", index === carousel.selectedScrollSnap()));
    const addDots = () => {
      dots.replaceChildren();
      carousel.scrollSnapList().forEach((_, index) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "w-3 h-3 rounded-[50%] mx-[5px] border-0 bg-neutral-border data-[active]:bg-brand cursor-pointer";
        dot.setAttribute("aria-label", `Image ${index + 1}`);
        dot.addEventListener("click", () => carousel.scrollTo(index), { signal });
        dots.append(dot);
      });
      update();
    };
    carousel.on("select", update);
    carousel.on("reInit", addDots);
    addDots();
    viewport.after(dots);
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      timers.push(setInterval(() => {
        if (!viewport.matches(":hover") && !lightbox.open)
          carousel.scrollNext();
      }, 5000));
    }
  });
  const registerModal = query("#registerModal");
  let previousFocus = null;
  const openModal = (modal) => {
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    modal.setAttribute("data-open", "");
    modal.setAttribute("aria-hidden", "false");
    document.body.setAttribute("data-modal-open", "");
    modal.querySelector("input")?.focus();
  };
  const closeModal = () => {
    root.querySelectorAll("[data-modal][data-open]").forEach((el) => {
      el.removeAttribute("data-open");
      el.setAttribute("aria-hidden", "true");
    });
    document.body.removeAttribute("data-modal-open");
    previousFocus?.focus();
  };
  const lightbox = document.createElement("dialog");
  lightbox.className = "w-full h-full max-w-none max-h-none px-[70px] py-10 max-md:px-[35px] max-md:py-[45px] bg-lightbox text-surface border-0 backdrop:bg-modal-overlay";
  const LIGHTBOX_BUTTON = "absolute bg-transparent text-surface border-0 text-[42px] cursor-pointer";
  lightbox.innerHTML = `<button type="button" data-lightbox="close" class="${LIGHTBOX_BUTTON} top-[5px] right-5" aria-label="Fermer">×</button><button type="button" data-lightbox="prev" class="${LIGHTBOX_BUTTON} left-3.75 top-[45%]" aria-label="Image précédente">‹</button><img alt="" class="inline-block w-full h-full object-contain"><button type="button" data-lightbox="next" class="${LIGHTBOX_BUTTON} right-3.75 top-[45%]" aria-label="Image suivante">›</button>`;
  root.append(lightbox);
  let gallery = [];
  let galleryIndex = 0;
  const showImage = (index) => {
    if (!gallery.length)
      return;
    galleryIndex = (index + gallery.length) % gallery.length;
    const anchor = gallery[galleryIndex];
    const image = lightbox.querySelector("img");
    if (anchor && image) {
      image.src = anchor.href;
      image.alt = anchor.querySelector("img")?.alt || "SENEMPLOI";
    }
  };
  lightbox.querySelector("[data-lightbox=close]")?.addEventListener("click", () => lightbox.close(), { signal });
  lightbox.querySelector("[data-lightbox=prev]")?.addEventListener("click", () => showImage(galleryIndex - 1), { signal });
  lightbox.querySelector("[data-lightbox=next]")?.addEventListener("click", () => showImage(galleryIndex + 1), { signal });
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox)
      lightbox.close();
  }, { signal });
  root.addEventListener("click", (event) => {
    if (!(event.target instanceof Element))
      return;
    const target = event.target.closest("a,button");
    if (!target)
      return;
    if (target.hasAttribute("data-dropbtn")) {
      const dropdown = target.closest("li");
      dropdown?.toggleAttribute("data-open");
      target.setAttribute("aria-expanded", String(dropdown?.hasAttribute("data-open")));
    }
    if (target.closest("#btn_show_contact_us") && contact) {
      const button = query("#btn_show_contact_us");
      if (button)
        button.hidden = true;
      contact.hidden = false;
      contact.setAttribute("data-revealed", "");
    }
    if (target.closest("[data-register]")) {
      event.preventDefault();
      if (registerModal)
        openModal(registerModal);
      else
        window.location.assign("/?inscription=1");
      closeMobile();
    }
    if (target.hasAttribute("data-close-modal") || target.closest("[data-modal]") && target.hasAttribute("data-close-modal"))
      closeModal();
    if (target.id.startsWith("voir-plus-")) {
      const number = target.id.split("-").at(-1);
      root.querySelectorAll(`[data-more="${number}"]`).forEach((el) => el.classList.remove("hidden"));
      target.hidden = true;
    }
    if (target.hasAttribute("data-back-to-top")) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (target instanceof HTMLAnchorElement && target.hasAttribute("data-gall")) {
      event.preventDefault();
      const group = target.getAttribute("data-gall");
      gallery = [...root.querySelectorAll("a[data-gall]")].filter((el) => el.getAttribute("data-gall") === group);
      showImage(gallery.indexOf(target));
      lightbox.showModal();
    }
    if (target instanceof HTMLAnchorElement && target.getAttribute("href")?.startsWith("#") && target.hash.length > 1) {
      const section = document.getElementById(decodeURIComponent(target.hash.slice(1)));
      if (section) {
        event.preventDefault();
        if (section === contact) {
          section.hidden = false;
          section.setAttribute("data-revealed", "");
        }
        section.scrollIntoView({ behavior: "smooth" });
        closeMobile();
      } else if (target.hash === "#contact") {
        event.preventDefault();
        window.location.assign(document.documentElement.hasAttribute("data-standalone") ? "index.html#contact" : "/#contact");
      }
    }
    if (target.hasAttribute("data-dismiss-alert"))
      target.closest("[data-alert]")?.classList.add("hidden");
  }, { signal });
  root.querySelectorAll("[data-modal]").forEach((modal) => modal.addEventListener("click", (event) => {
    if (event.target === modal)
      closeModal();
  }, { signal }));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
      closeMobile();
    }
    if (lightbox.open && event.key === "ArrowLeft")
      showImage(galleryIndex - 1);
    if (lightbox.open && event.key === "ArrowRight")
      showImage(galleryIndex + 1);
    const modal = query("[data-modal][data-open]");
    if (event.key === "Tab" && modal) {
      const items = [...modal.querySelectorAll("button,input,select,textarea,a[href]")];
      const first = items.at(0);
      const last = items.at(-1);
      if (event.shiftKey && document.activeElement === first && last) {
        event.preventDefault();
        last.focus();
      }
      if (!event.shiftKey && document.activeElement === last && first) {
        event.preventDefault();
        first.focus();
      }
    }
  }, { signal });
  const brochure = query("#telecharger_brochure");
  brochure?.addEventListener("click", () => {
    const anchor = document.createElement("a");
    anchor.href = document.documentElement.lang === "en" ? brochure.dataset["en"] || "" : brochure.dataset["fr"] || "";
    anchor.download = document.documentElement.lang === "en" ? "BROCHURE-EN.pdf" : "BROCHURE-FR.pdf";
    root.append(anchor);
    anchor.click();
    anchor.remove();
  }, { signal });
  root.querySelectorAll("form").forEach((form) => {
    const registration = form.id !== "contactForm";
    form.querySelectorAll("input,textarea").forEach((input) => {
      if (input.type !== "hidden")
        input.required = true;
      const rule = input.dataset["rule"];
      if (rule?.startsWith("minlen:"))
        input.minLength = Number(rule.split(":").at(-1));
    });
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!form.reportValidity())
        return;
      const value = (name) => form.querySelector(`[name="${name}"]`)?.value || "";
      const fullName = value("fullName") || form.querySelector("#registerFullName")?.value || `${value("prenom")} ${value("nom")}`.trim();
      const email = value("email") || form.querySelector("input[type=email]")?.value || "";
      const phone = value("phone") || form.querySelector("#registerPhone")?.value || value("telephone");
      const body = registration ? { fullName, email, phone } : { fullName, email, subject: value("subject"), message: value("message") };
      const submit = form.querySelector("button[type=submit],button:not([type])");
      const label = submit?.childNodes[0]?.textContent?.trim() || "Envoyer";
      const feedback = form.querySelector("[data-feedback]") || document.createElement("p");
      feedback.setAttribute("data-feedback", "");
      feedback.className = "mt-3.75 mb-0 text-center text-brand";
      feedback.setAttribute("role", "status");
      if (!feedback.parentNode)
        form.append(feedback);
      feedback.textContent = "";
      if (submit) {
        submit.disabled = true;
        submit.textContent = "En cours...";
      }
      try {
        const response = await fetch(`https://volkodoo.pythonanywhere.com/api/v1/${registration ? "participants" : "contacts"}/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          credentials: "include",
          signal
        });
        if (!response.ok)
          throw new Error(`HTTP ${response.status}`);
        form.reset();
        if (registration)
          feedback.textContent = "Votre inscription à bien été enregistrée.";
        else {
          query("#sendmessage")?.classList.remove("hidden");
          feedback.textContent = "Votre message a bien été envoyé. Merci!";
        }
      } catch (error) {
        if (!signal.aborted) {
          feedback.classList.replace("text-brand", "text-error");
          feedback.textContent = registration ? "Une erreur est survenue lors l'inscription" : "Une erreur lord de l'envoie est survenu";
        }
      } finally {
        if (submit) {
          submit.disabled = false;
          submit.textContent = label;
        }
      }
    }, { signal });
  });
  const win = window;
  win.gtranslateSettings = { default_language: "fr", native_language_names: true, detect_browser_language: false, languages: ["fr", "en"], wrapper_selector: ".gtranslate_wrapper", flag_style: "3d", alt_flags: { en: "usa" } };
  const translation = document.createElement("script");
  translation.src = "https://cdn.gtranslate.net/widgets/latest/flags.js";
  translation.async = true;
  root.append(translation);
  if (new URLSearchParams(window.location.search).get("inscription") === "1" && registerModal)
    openModal(registerModal);
  return () => {
    controller.abort();
    observer.disconnect();
    closeModal();
    closeMobile();
    carousels.forEach((carousel) => carousel.destroy());
    timers.forEach((timer) => clearInterval(timer));
    mobile?.remove();
    toggle.remove();
    overlay.remove();
    lightbox.remove();
    translation.remove();
  };
}
if (typeof document !== "undefined" && document.documentElement.hasAttribute("data-standalone")) {
  setupSite(document.body);
}
export {
  setupSite
};
