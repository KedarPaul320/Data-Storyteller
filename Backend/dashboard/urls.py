from django.urls import path
from.views import FileUploadView , AnalyzeDataView, GenerateChartView

urlpatterns = [
    path('upload/', FileUploadView.as_view(), name='file-upload'),
    path('analyze/', AnalyzeDataView.as_view(), name='analyze-data'),
    path('chart/generate/', GenerateChartView.as_view(), name='generate-chart'),
]