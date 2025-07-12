﻿using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Wino.Calendar.Args;
using Wino.Calendar.ViewModels.Data;
using Wino.Core.Domain.Enums;
using Wino.Core.Domain.Models.Calendar;
using Wino.Helpers;

namespace Wino.Calendar.Controls;

public partial class WinoCalendarControl : Control
{
    private const string PART_WinoFlipView = nameof(PART_WinoFlipView);
    private const string PART_IdleGrid = nameof(PART_IdleGrid);

    public event EventHandler<TimelineCellSelectedArgs> TimelineCellSelected;
    public event EventHandler<TimelineCellUnselectedArgs> TimelineCellUnselected;

    public event EventHandler ScrollPositionChanging;

    #region Dependency Properties

    public static readonly DependencyProperty DayRangesProperty = DependencyProperty.Register(nameof(DayRanges), typeof(ObservableCollection<DayRangeRenderModel>), typeof(WinoCalendarControl), new PropertyMetadata(null));
    public static readonly DependencyProperty SelectedFlipViewIndexProperty = DependencyProperty.Register(nameof(SelectedFlipViewIndex), typeof(int), typeof(WinoCalendarControl), new PropertyMetadata(-1));
    public static readonly DependencyProperty SelectedFlipViewDayRangeProperty = DependencyProperty.Register(nameof(SelectedFlipViewDayRange), typeof(DayRangeRenderModel), typeof(WinoCalendarControl), new PropertyMetadata(null));
    public static readonly DependencyProperty ActiveCanvasProperty = DependencyProperty.Register(nameof(ActiveCanvas), typeof(WinoDayTimelineCanvas), typeof(WinoCalendarControl), new PropertyMetadata(null, new PropertyChangedCallback(OnActiveCanvasChanged)));
    public static readonly DependencyProperty IsFlipIdleProperty = DependencyProperty.Register(nameof(IsFlipIdle), typeof(bool), typeof(WinoCalendarControl), new PropertyMetadata(true, new PropertyChangedCallback(OnIdleStateChanged)));
    public static readonly DependencyProperty ActiveScrollViewerProperty = DependencyProperty.Register(nameof(ActiveScrollViewer), typeof(ScrollViewer), typeof(WinoCalendarControl), new PropertyMetadata(null, new PropertyChangedCallback(OnActiveVerticalScrollViewerChanged)));

    public static readonly DependencyProperty VerticalItemsPanelTemplateProperty = DependencyProperty.Register(nameof(VerticalItemsPanelTemplate), typeof(ItemsPanelTemplate), typeof(WinoCalendarControl), new PropertyMetadata(null, new PropertyChangedCallback(OnCalendarOrientationPropertiesUpdated)));
    public static readonly DependencyProperty HorizontalItemsPanelTemplateProperty = DependencyProperty.Register(nameof(HorizontalItemsPanelTemplate), typeof(ItemsPanelTemplate), typeof(WinoCalendarControl), new PropertyMetadata(null, new PropertyChangedCallback(OnCalendarOrientationPropertiesUpdated)));
    public static readonly DependencyProperty OrientationProperty = DependencyProperty.Register(nameof(Orientation), typeof(CalendarOrientation), typeof(WinoCalendarControl), new PropertyMetadata(CalendarOrientation.Horizontal, new PropertyChangedCallback(OnCalendarOrientationPropertiesUpdated)));
    public static readonly DependencyProperty DisplayTypeProperty = DependencyProperty.Register(nameof(DisplayType), typeof(CalendarDisplayType), typeof(WinoCalendarControl), new PropertyMetadata(CalendarDisplayType.Day));

    /// <summary>
    /// Gets or sets the day-week-month-year display type.
    /// Orientation is not determined by this property, but Orientation property.
    /// This property is used to determine the template to use for the calendar.
    /// </summary>
    public CalendarDisplayType DisplayType
    {
        get { return (CalendarDisplayType)GetValue(DisplayTypeProperty); }
        set { SetValue(DisplayTypeProperty, value); }
    }

    public CalendarOrientation Orientation
    {
        get { return (CalendarOrientation)GetValue(OrientationProperty); }
        set { SetValue(OrientationProperty, value); }
    }

    public ItemsPanelTemplate VerticalItemsPanelTemplate
    {
        get { return (ItemsPanelTemplate)GetValue(VerticalItemsPanelTemplateProperty); }
        set { SetValue(VerticalItemsPanelTemplateProperty, value); }
    }

    public ItemsPanelTemplate HorizontalItemsPanelTemplate
    {
        get { return (ItemsPanelTemplate)GetValue(HorizontalItemsPanelTemplateProperty); }
        set { SetValue(HorizontalItemsPanelTemplateProperty, value); }
    }

    public DayRangeRenderModel SelectedFlipViewDayRange
    {
        get { return (DayRangeRenderModel)GetValue(SelectedFlipViewDayRangeProperty); }
        set { SetValue(SelectedFlipViewDayRangeProperty, value); }
    }

    public ScrollViewer ActiveScrollViewer
    {
        get { return (ScrollViewer)GetValue(ActiveScrollViewerProperty); }
        set { SetValue(ActiveScrollViewerProperty, value); }
    }

    public WinoDayTimelineCanvas ActiveCanvas
    {
        get { return (WinoDayTimelineCanvas)GetValue(ActiveCanvasProperty); }
        set { SetValue(ActiveCanvasProperty, value); }
    }

    public bool IsFlipIdle
    {
        get { return (bool)GetValue(IsFlipIdleProperty); }
        set { SetValue(IsFlipIdleProperty, value); }
    }

    /// <summary>
    /// Gets or sets the collection of day ranges to render.
    /// Each day range usually represents a week, but it may support other ranges.
    /// </summary>
    public ObservableCollection<DayRangeRenderModel> DayRanges
    {
        get { return (ObservableCollection<DayRangeRenderModel>)GetValue(DayRangesProperty); }
        set { SetValue(DayRangesProperty, value); }
    }

    public int SelectedFlipViewIndex
    {
        get { return (int)GetValue(SelectedFlipViewIndexProperty); }
        set { SetValue(SelectedFlipViewIndexProperty, value); }
    }

    #endregion

    private WinoCalendarFlipView InternalFlipView;
    private Grid IdleGrid;

    public WinoCalendarControl()
    {
        DefaultStyleKey = typeof(WinoCalendarControl);
        SizeChanged += CalendarSizeChanged;
    }

    private static void OnCalendarOrientationPropertiesUpdated(DependencyObject calendar, DependencyPropertyChangedEventArgs e)
    {
        if (calendar is WinoCalendarControl control)
        {
            control.ManageCalendarOrientation();
        }
    }

    private static void OnIdleStateChanged(DependencyObject calendar, DependencyPropertyChangedEventArgs e)
    {
        if (calendar is WinoCalendarControl calendarControl)
        {
            calendarControl.UpdateIdleState();
        }
    }


    private static void OnActiveVerticalScrollViewerChanged(DependencyObject calendar, DependencyPropertyChangedEventArgs e)
    {
        if (calendar is WinoCalendarControl calendarControl)
        {
            if (e.OldValue is ScrollViewer oldScrollViewer)
            {
                calendarControl.DeregisterScrollChanges(oldScrollViewer);
            }

            if (e.NewValue is ScrollViewer newScrollViewer)
            {
                calendarControl.RegisterScrollChanges(newScrollViewer);
            }

            calendarControl.ManageHighlightedDateRange();
        }
    }


    private static void OnActiveCanvasChanged(DependencyObject calendar, DependencyPropertyChangedEventArgs e)
    {
        if (calendar is WinoCalendarControl calendarControl)
        {
            if (e.OldValue is WinoDayTimelineCanvas oldCanvas)
            {
                // Dismiss any selection on the old canvas.
                calendarControl.DeregisterCanvas(oldCanvas);
            }

            if (e.NewValue is WinoDayTimelineCanvas newCanvas)
            {
                calendarControl.RegisterCanvas(newCanvas);
            }

            calendarControl.ManageHighlightedDateRange();
        }
    }

    private void ManageCalendarOrientation()
    {
        if (InternalFlipView == null || HorizontalItemsPanelTemplate == null || VerticalItemsPanelTemplate == null) return;

        InternalFlipView.ItemsPanel = Orientation == CalendarOrientation.Horizontal ? HorizontalItemsPanelTemplate : VerticalItemsPanelTemplate;
    }

    private void ManageHighlightedDateRange()
        => SelectedFlipViewDayRange = InternalFlipView.SelectedItem as DayRangeRenderModel;

    private void DeregisterCanvas(WinoDayTimelineCanvas canvas)
    {
        if (canvas == null) return;

        canvas.SelectedDateTime = null;
        canvas.TimelineCellSelected -= ActiveTimelineCellSelected;
        canvas.TimelineCellUnselected -= ActiveTimelineCellUnselected;
    }

    private void RegisterCanvas(WinoDayTimelineCanvas canvas)
    {
        if (canvas == null) return;

        canvas.SelectedDateTime = null;
        canvas.TimelineCellSelected += ActiveTimelineCellSelected;
        canvas.TimelineCellUnselected += ActiveTimelineCellUnselected;
    }

    private void RegisterScrollChanges(ScrollViewer scrollViewer)
    {
        if (scrollViewer == null) return;

        scrollViewer.ViewChanging += ScrollViewChanging;
    }

    private void DeregisterScrollChanges(ScrollViewer scrollViewer)
    {
        if (scrollViewer == null) return;

        scrollViewer.ViewChanging -= ScrollViewChanging;
    }

    private void ScrollViewChanging(object sender, ScrollViewerViewChangingEventArgs e)
        => ScrollPositionChanging?.Invoke(this, EventArgs.Empty);

    private void CalendarSizeChanged(object sender, SizeChangedEventArgs e)
    {
        if (ActiveCanvas == null) return;

        ActiveCanvas.SelectedDateTime = null;
    }

    protected override void OnApplyTemplate()
    {
        base.OnApplyTemplate();

        InternalFlipView = GetTemplateChild(PART_WinoFlipView) as WinoCalendarFlipView;
        IdleGrid = GetTemplateChild(PART_IdleGrid) as Grid;

        UpdateIdleState();
        ManageCalendarOrientation();
    }

    private void UpdateIdleState()
    {
        InternalFlipView.Opacity = IsFlipIdle ? 0 : 1;
        IdleGrid.Visibility = IsFlipIdle ? Visibility.Visible : Visibility.Collapsed;
    }

    private void ActiveTimelineCellUnselected(object sender, TimelineCellUnselectedArgs e)
        => TimelineCellUnselected?.Invoke(this, e);

    private void ActiveTimelineCellSelected(object sender, TimelineCellSelectedArgs e)
        => TimelineCellSelected?.Invoke(this, e);

    public void NavigateToDay(DateTime dateTime) => InternalFlipView.NavigateToDay(dateTime);

    public async void NavigateToHour(TimeSpan timeSpan)
    {
        if (ActiveScrollViewer == null) return;

        // Total height of the FlipViewItem is the same as vertical ScrollViewer to position day headers.

        await Task.Yield();
        await Dispatcher.RunAsync(Windows.UI.Core.CoreDispatcherPriority.High, () =>
        {
            double hourHeght = 60;
            double totalHeight = ActiveScrollViewer.ScrollableHeight;
            double scrollPosition = timeSpan.TotalHours * hourHeght;

            ActiveScrollViewer.ChangeView(null, scrollPosition, null, disableAnimation: false);
        });
    }
    public void ResetTimelineSelection()
    {
        if (ActiveCanvas == null) return;

        ActiveCanvas.SelectedDateTime = null;
    }

    public void GoNextRange()
    {
        if (InternalFlipView == null) return;

        InternalFlipView.GoNextFlip();
    }

    public void GoPreviousRange()
    {
        if (InternalFlipView == null) return;

        InternalFlipView.GoPreviousFlip();
    }

    public void UnselectActiveTimelineCell()
    {
        if (ActiveCanvas == null) return;

        ActiveCanvas.SelectedDateTime = null;
    }

    public CalendarItemControl GetCalendarItemControl(CalendarItemViewModel calendarItemViewModel)
    {
        return this.FindDescendants<CalendarItemControl>().FirstOrDefault(a => a.CalendarItem == calendarItemViewModel);
    }
}
