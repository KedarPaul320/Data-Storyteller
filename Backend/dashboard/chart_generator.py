import pandas as pd
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import json


def is_numeric(series):
    """Check if a pandas series contains numeric values."""
    try:
        pd.to_numeric(series, errors='coerce').notna().any()
        return pd.to_numeric(series, errors='coerce').notna().sum() > 0
    except:
        return False


def get_numeric_values(series):
    """Convert series to numeric values, handling non-numeric entries."""
    return pd.to_numeric(series, errors='coerce')


def generate_bar_chart(df, x_col, y_col):
    """Generate a bar chart."""
    if is_numeric(df[y_col]):
        # Group by x and sum y
        grouped = df.groupby(x_col)[y_col].apply(lambda x: get_numeric_values(x).sum()).reset_index()
    else:
        # Count records per group
        grouped = df.groupby(x_col).size().reset_index(name=y_col)

    fig = go.Figure(data=[
        go.Bar(x=grouped[x_col], y=grouped[y_col], marker_color='#1D4ED8')
    ])
    fig.update_layout(
        title=f'{y_col} by {x_col}',
        xaxis_title=x_col,
        yaxis_title=y_col,
        hovermode='x unified',
        template='plotly_white',
        height=400
    )
    return fig


def generate_line_chart(df, x_col, y_col):
    """Generate a line chart."""
    if is_numeric(df[y_col]):
        grouped = df.groupby(x_col)[y_col].apply(lambda x: get_numeric_values(x).sum()).reset_index()
    else:
        grouped = df.groupby(x_col).size().reset_index(name=y_col)

    # Sort by x if numeric
    if is_numeric(grouped[x_col]):
        grouped = grouped.sort_values(x_col)

    fig = go.Figure(data=[
        go.Scatter(x=grouped[x_col], y=grouped[y_col], mode='lines+markers',
                   line=dict(color='#F59E0B', width=2), marker=dict(size=6))
    ])
    fig.update_layout(
        title=f'{y_col} by {x_col}',
        xaxis_title=x_col,
        yaxis_title=y_col,
        hovermode='x unified',
        template='plotly_white',
        height=400
    )
    return fig


def generate_scatter_chart(df, x_col, y_col):
    """Generate a scatter chart."""
    x_numeric = get_numeric_values(df[x_col])
    y_numeric = get_numeric_values(df[y_col])

    # Only include rows with valid numeric values
    valid_mask = x_numeric.notna() & y_numeric.notna()
    x_data = x_numeric[valid_mask]
    y_data = y_numeric[valid_mask]

    fig = go.Figure(data=[
        go.Scatter(x=x_data, y=y_data, mode='markers',
                   marker=dict(size=8, color='#F97316', opacity=0.6))
    ])
    fig.update_layout(
        title=f'{y_col} vs {x_col}',
        xaxis_title=x_col,
        yaxis_title=y_col,
        hovermode='closest',
        template='plotly_white',
        height=400
    )
    return fig


def generate_pie_chart(df, x_col, y_col):
    """Generate a pie chart."""
    if is_numeric(df[y_col]):
        grouped = df.groupby(x_col)[y_col].apply(lambda x: get_numeric_values(x).sum()).reset_index()
    else:
        grouped = df.groupby(x_col).size().reset_index(name=y_col)

    fig = go.Figure(data=[
        go.Pie(labels=grouped[x_col], values=grouped[y_col],
                marker=dict(colors=['#1D4ED8', '#F59E0B', '#F97316', '#0F766E', '#7C3AED', '#DC2626']))
    ])
    fig.update_layout(
        title=f'{y_col} Distribution by {x_col}',
        height=400
    )
    return fig


def generate_area_chart(df, x_col, y_col):
    """Generate an area chart."""
    if is_numeric(df[y_col]):
        grouped = df.groupby(x_col)[y_col].apply(lambda x: get_numeric_values(x).sum()).reset_index()
    else:
        grouped = df.groupby(x_col).size().reset_index(name=y_col)

    # Sort by x if numeric
    if is_numeric(grouped[x_col]):
        grouped = grouped.sort_values(x_col)

    fig = go.Figure(data=[
        go.Scatter(x=grouped[x_col], y=grouped[y_col], mode='lines',
                   fill='tozeroy', line=dict(color='#0F766E', width=2),
                   marker=dict(size=6))
    ])
    fig.update_layout(
        title=f'{y_col} by {x_col} (Area)',
        xaxis_title=x_col,
        yaxis_title=y_col,
        hovermode='x unified',
        template='plotly_white',
        height=400
    )
    return fig


def generate_box_chart(df, x_col, y_col):
    """Generate a box plot."""
    y_numeric = get_numeric_values(df[y_col])

    fig = go.Figure(data=[
        go.Box(y=y_numeric, name=y_col, marker_color='#7C3AED')
    ])
    fig.update_layout(
        title=f'Distribution of {y_col}',
        yaxis_title=y_col,
        template='plotly_white',
        height=400
    )
    return fig


def generate_histogram_chart(df, x_col, y_col):
    """Generate a histogram."""
    x_numeric = get_numeric_values(df[x_col])
    valid_mask = x_numeric.notna()
    x_data = x_numeric[valid_mask]

    fig = go.Figure(data=[
        go.Histogram(x=x_data, nbinsx=30, marker_color='#DC2626')
    ])
    fig.update_layout(
        title=f'Distribution of {x_col}',
        xaxis_title=x_col,
        yaxis_title='Count',
        template='plotly_white',
        height=400
    )
    return fig


def generate_chart(df, chart_type, x_col, y_col):
    """
    Generate a Plotly chart and return as JSON-serializable figure data.

    Args:
        df: pandas DataFrame
        chart_type: str - one of 'bar', 'line', 'scatter', 'pie', 'area', 'box', 'histogram'
        x_col: str - column name for x-axis
        y_col: str - column name for y-axis

    Returns:
        dict - Plotly figure data suitable for JSON serialization
    """
    if chart_type == 'bar':
        fig = generate_bar_chart(df, x_col, y_col)
    elif chart_type == 'line':
        fig = generate_line_chart(df, x_col, y_col)
    elif chart_type == 'scatter':
        fig = generate_scatter_chart(df, x_col, y_col)
    elif chart_type == 'pie':
        fig = generate_pie_chart(df, x_col, y_col)
    elif chart_type == 'area':
        fig = generate_area_chart(df, x_col, y_col)
    elif chart_type == 'box':
        fig = generate_box_chart(df, x_col, y_col)
    elif chart_type == 'histogram':
        fig = generate_histogram_chart(df, x_col, y_col)
    else:
        raise ValueError(f"Unsupported chart type: {chart_type}")

    # Return figure as JSON-serializable dict
    return fig.to_dict()
